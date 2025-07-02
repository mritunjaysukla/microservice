"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ZipService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const piscina_1 = require("piscina");
const path = require("path");
const fs = require("fs");
const uuid_1 = require("uuid");
let ZipService = ZipService_1 = class ZipService {
    constructor() {
        this.logger = new common_1.Logger(ZipService_1.name);
        this.JOB_PREFIX = 'zipjob:';
        this.ACTIVE_JOBS_KEY = 'zip:active_jobs';
        this.MAX_CONCURRENT_JOBS = 10;
        this.ZIP_EXPIRY_HOURS = 6;
        this.redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            retryStrategy: () => 100,
            maxRetriesPerRequest: 3,
        });
    }
    onModuleInit() {
        const workerPath = path.resolve(__dirname, './workers/zip-worker.js');
        const tsWorkerPath = path.resolve(__dirname, './workers/zip-worker.ts');
        this.piscina = new piscina_1.Piscina({
            filename: fs.existsSync(workerPath) ? workerPath : tsWorkerPath,
            maxThreads: parseInt(process.env.ZIP_MAX_THREADS || '4'),
            minThreads: parseInt(process.env.ZIP_MIN_THREADS || '1'),
            idleTimeout: 60000,
            maxQueue: 50,
            execArgv: fs.existsSync(workerPath) ? [] : ['-r', 'ts-node/register'],
        });
        this.logger.log(`Worker pool initialized: ${this.piscina.threads.length} threads`);
        this.logger.log(`Using worker file: ${fs.existsSync(workerPath) ? workerPath : tsWorkerPath}`);
    }
    onModuleDestroy() {
        this.redis.disconnect();
        if (this.piscina) {
            this.piscina.destroy();
        }
    }
    async createZipJob(dto) {
        if (!dto.fileUrls || dto.fileUrls.length === 0) {
            throw new common_1.HttpException('No file URLs provided', common_1.HttpStatus.BAD_REQUEST);
        }
        const activeJobs = await this.redis.scard(this.ACTIVE_JOBS_KEY);
        if (activeJobs >= this.MAX_CONCURRENT_JOBS) {
            throw new common_1.HttpException('Server is busy. Please try again later.', common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
        const jobId = `job-${(0, uuid_1.v4)()}`;
        const now = Date.now();
        const expiresAt = now + (this.ZIP_EXPIRY_HOURS * 60 * 60 * 1000);
        await this.redis.hmset(this.JOB_PREFIX + jobId, {
            status: 'pending',
            zipFileName: dto.zipFileName || `archive-${Date.now()}.zip`,
            error: '',
            fileUrls: JSON.stringify(dto.fileUrls),
            createdAt: now.toString(),
            expiresAt: expiresAt.toString(),
            fileCount: dto.fileUrls.length.toString(),
            progress: '0',
        });
        await this.redis.sadd(this.ACTIVE_JOBS_KEY, jobId);
        await this.redis.expire(this.JOB_PREFIX + jobId, this.ZIP_EXPIRY_HOURS * 3600);
        this.processZipJob(jobId, dto).catch((err) => {
            this.logger.error(`Zip job ${jobId} failed:`, err);
            this.updateJobStatus(jobId, 'failed', err.message);
        });
        return jobId;
    }
    async processZipJob(jobId, dto) {
        try {
            await this.updateJobStatus(jobId, 'processing');
            const validUrls = await this.validatePresignedUrls(dto.fileUrls);
            if (validUrls.length === 0) {
                throw new Error('No valid presigned URLs found');
            }
            if (validUrls.length < dto.fileUrls.length) {
                this.logger.warn(`${dto.fileUrls.length - validUrls.length} URLs were invalid and skipped`);
            }
            const result = await this.piscina.run({
                fileUrls: validUrls,
                zipFileName: dto.zipFileName,
                jobId: jobId,
            });
            await this.redis.hmset(this.JOB_PREFIX + jobId, {
                status: 'completed',
                tempFilePath: result.filePath,
                fileSize: result.fileSize?.toString() || '0',
                successCount: result.successCount?.toString() || '0',
                completedAt: Date.now().toString(),
            });
        }
        catch (error) {
            await this.updateJobStatus(jobId, 'failed', error.message);
            throw error;
        }
        finally {
            await this.redis.srem(this.ACTIVE_JOBS_KEY, jobId);
        }
    }
    async validatePresignedUrls(urls) {
        const validUrls = [];
        for (const url of urls) {
            try {
                const parsedUrl = new URL(decodeURIComponent(url));
                if (parsedUrl.searchParams.size > 0) {
                    validUrls.push(url);
                }
                else {
                    this.logger.warn(`Invalid presigned URL format: ${url}`);
                }
            }
            catch (err) {
                this.logger.warn(`Invalid URL: ${url}`);
            }
        }
        return validUrls;
    }
    async getJobStatus(jobId) {
        const jobKey = this.JOB_PREFIX + jobId;
        const job = await this.redis.hgetall(jobKey);
        if (!job || Object.keys(job).length === 0) {
            return { status: 'not_found' };
        }
        const result = {
            status: job.status,
            fileCount: parseInt(job.fileCount || '0'),
            createdAt: job.createdAt,
            expiresAt: job.expiresAt,
        };
        switch (job.status) {
            case 'pending':
                result.message = 'Job is queued for processing';
                break;
            case 'processing':
                result.message = 'Files are being zipped';
                result.progress = `${job.progress || 0}% complete`;
                break;
            case 'completed':
                result.downloadUrl = `/zip/download/${jobId}`;
                result.fileSize = this.formatFileSize(parseInt(job.fileSize || '0'));
                result.successCount = parseInt(job.successCount || '0');
                break;
            case 'failed':
                result.error = job.error;
                result.successCount = parseInt(job.successCount || '0');
                result.partialSuccess = result.successCount > 0;
                break;
        }
        return result;
    }
    async downloadZip(jobId, res, inline = false) {
        const jobKey = this.JOB_PREFIX + jobId;
        const job = await this.redis.hgetall(jobKey);
        if (!job || job.status !== 'completed' || !job.tempFilePath) {
            throw new common_1.HttpException('Zip file not found or not ready', common_1.HttpStatus.NOT_FOUND);
        }
        const filePath = job.tempFilePath;
        if (!fs.existsSync(filePath)) {
            throw new common_1.HttpException('Zip file has expired. Please create a new job.', common_1.HttpStatus.GONE);
        }
        const stats = fs.statSync(filePath);
        const disposition = inline ? 'inline' : 'attachment';
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Length', stats.size.toString());
        res.setHeader('Content-Disposition', `${disposition}; filename="${job.zipFileName || 'archive.zip'}"`);
        res.setHeader('Cache-Control', 'no-cache');
        const readStream = fs.createReadStream(filePath);
        readStream.on('error', (err) => {
            this.logger.error('Error streaming zip file:', err);
            if (!res.headersSent) {
                res.status(500).send('Download error');
            }
        });
        readStream.on('end', () => {
            this.cleanupJob(jobId, filePath);
        });
        readStream.pipe(res);
    }
    async listJobs(status, limit = 20) {
        const pattern = this.JOB_PREFIX + '*';
        const keys = await this.redis.keys(pattern);
        const jobs = [];
        for (const key of keys.slice(0, limit)) {
            const job = await this.redis.hgetall(key);
            if (!status || job.status === status) {
                const jobId = key.replace(this.JOB_PREFIX, '');
                jobs.push({
                    jobId,
                    status: job.status,
                    createdAt: new Date(parseInt(job.createdAt || '0')).toISOString(),
                    fileCount: parseInt(job.fileCount || '0'),
                    zipFileName: job.zipFileName,
                });
            }
        }
        return {
            jobs: jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            total: jobs.length,
        };
    }
    async cancelJob(jobId) {
        const jobKey = this.JOB_PREFIX + jobId;
        const job = await this.redis.hgetall(jobKey);
        if (!job || Object.keys(job).length === 0) {
            throw new common_1.HttpException('Job not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (job.status === 'completed' || job.status === 'failed') {
            throw new common_1.HttpException('Job cannot be cancelled (already completed or failed)', common_1.HttpStatus.CONFLICT);
        }
        await this.redis.hset(jobKey, 'status', 'cancelled');
        await this.redis.srem(this.ACTIVE_JOBS_KEY, jobId);
        return {
            message: 'Job cancelled successfully',
            jobId,
        };
    }
    async getHealthStatus() {
        const activeJobs = await this.redis.scard(this.ACTIVE_JOBS_KEY);
        return {
            status: 'healthy',
            workers: {
                active: this.piscina.threads.length,
                total: this.piscina.options.maxThreads,
                queue: this.piscina.queueSize,
            },
            redis: this.redis.status,
            activeJobs,
            uptime: process.uptime(),
        };
    }
    async updateJobStatus(jobId, status, error) {
        const updates = { status };
        if (error)
            updates.error = error;
        await this.redis.hmset(this.JOB_PREFIX + jobId, updates);
    }
    async cleanupJob(jobId, filePath) {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err)
                    this.logger.error(`Failed to delete temp file: ${filePath}`, err);
                else
                    this.logger.log(`Cleaned up temp file: ${filePath}`);
            });
        }
        await this.redis.del(this.JOB_PREFIX + jobId);
        await this.redis.srem(this.ACTIVE_JOBS_KEY, jobId);
    }
    formatFileSize(bytes) {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};
exports.ZipService = ZipService;
exports.ZipService = ZipService = ZipService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ZipService);
//# sourceMappingURL=zip.service.js.map