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
const archiver = require("archiver");
const axios_1 = require("axios");
let ZipService = ZipService_1 = class ZipService {
    constructor() {
        this.logger = new common_1.Logger(ZipService_1.name);
        this.JOB_PREFIX = 'zipjob:';
        this.redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        });
        this.piscina = new piscina_1.Piscina({
            filename: path.resolve(__dirname, './workers/zip.worker.js'),
            maxThreads: 4,
            minThreads: 1,
            execArgv: [],
        });
    }
    onModuleInit() {
    }
    onModuleDestroy() {
        this.redis.disconnect();
    }
    async archiveAndStreamZip(dto, res) {
        const { fileUrls, zipFileName } = dto;
        if (!fileUrls || fileUrls.length === 0) {
            throw new Error('No file URLs provided');
        }
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipFileName || 'archive.zip'}"`);
        const archive = archiver('zip');
        archive.pipe(res);
        try {
            for (const fileUrl of fileUrls) {
                try {
                    const decodedUrl = decodeURIComponent(fileUrl);
                    const response = await axios_1.default.get(decodedUrl, { responseType: 'stream' });
                    let fileName = decodedUrl.split('/').pop() || `file-${(0, uuid_1.v4)()}`;
                    fileName = fileName.replace(/\.(heic|mov)$/i, '.jpg');
                    archive.append(response.data, { name: fileName });
                }
                catch (err) {
                    this.logger.error(`Error fetching or appending file ${fileUrl}: ${err.message}`);
                    continue;
                }
            }
            await archive.finalize();
        }
        catch (err) {
            this.logger.error('Error during zip archive creation', err);
            if (!res.headersSent) {
                res.status(500).send('Error creating ZIP archive');
            }
        }
    }
    async createZipJob(dto) {
        if (!dto.fileUrls || dto.fileUrls.length === 0) {
            throw new Error('No file URLs provided');
        }
        const jobId = `job-${(0, uuid_1.v4)()}`;
        await this.redis.hmset(this.JOB_PREFIX + jobId, {
            status: 'pending',
            zipFileName: dto.zipFileName || 'archive.zip',
            error: '',
            fileUrls: JSON.stringify(dto.fileUrls),
        });
        this.runZipJob(jobId, dto).catch((err) => {
            this.logger.error(`Zip job ${jobId} failed`, err);
            this.redis.hset(this.JOB_PREFIX + jobId, 'status', 'failed');
            this.redis.hset(this.JOB_PREFIX + jobId, 'error', err.message);
        });
        return jobId;
    }
    async runZipJob(jobId, dto) {
        await this.redis.hset(this.JOB_PREFIX + jobId, 'status', 'processing');
        const tempFilePath = await this.piscina.run({
            fileUrls: dto.fileUrls,
            zipFileName: dto.zipFileName,
        });
        await this.redis.hset(this.JOB_PREFIX + jobId, 'status', 'done');
        await this.redis.hset(this.JOB_PREFIX + jobId, 'tempFilePath', tempFilePath);
    }
    async getJobStatus(jobId) {
        const jobKey = this.JOB_PREFIX + jobId;
        const job = await this.redis.hgetall(jobKey);
        if (!job || Object.keys(job).length === 0) {
            return { status: 'not_found' };
        }
        if (job.status === 'done') {
            return {
                status: 'done',
                downloadUrl: `/zip/job/download/${jobId}`,
            };
        }
        return { status: job.status, error: job.error || undefined };
    }
    async downloadZip(jobId, res) {
        const jobKey = this.JOB_PREFIX + jobId;
        const job = await this.redis.hgetall(jobKey);
        if (!job || job.status !== 'done' || !job.tempFilePath) {
            res.status(404).send('Zip file not found or not ready');
            return;
        }
        const filePath = job.tempFilePath;
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${job.zipFileName || 'archive.zip'}"`);
        const readStream = fs.createReadStream(filePath);
        readStream.pipe(res);
        readStream.on('close', () => {
            fs.unlink(filePath, () => { });
            this.redis.del(jobKey);
        });
        readStream.on('error', (err) => {
            this.logger.error('Error streaming zip file', err);
            if (!res.headersSent)
                res.status(500).send('Download error');
        });
    }
};
exports.ZipService = ZipService;
exports.ZipService = ZipService = ZipService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ZipService);
//# sourceMappingURL=zip.service.js.map