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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ZipService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const archiver_1 = require("archiver");
const fs_1 = require("fs");
const aws_sdk_1 = require("aws-sdk");
const axios_1 = require("axios");
const p_limit_1 = require("p-limit");
const zip_interface_1 = require("./interfaces/zip.interface");
let ZipService = ZipService_1 = class ZipService {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(ZipService_1.name);
        this.CONCURRENT_DOWNLOADS = 5;
        this.ZIP_EXPIRY_HOURS = 24;
        this.s3 = new aws_sdk_1.default.S3({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    async processZipRequest(data) {
        const jobId = `zip_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        const job = {
            jobId,
            folderId: data.folderId,
            status: zip_interface_1.ZipJobStatus.PENDING,
            progress: 0,
            totalFiles: 0,
            processedFiles: 0,
        };
        await this.cacheManager.set(`zip:${jobId}`, JSON.stringify(job), this.ZIP_EXPIRY_HOURS * 3600);
        this.createZip(job).catch((error) => {
            this.logger.error(`ZIP creation failed for job ${jobId}: ${error.message}`);
            this.updateJobStatus(jobId, zip_interface_1.ZipJobStatus.FAILED, error.message);
        });
        return jobId;
    }
    async createZip(job) {
        try {
            await this.updateJobStatus(job.jobId, zip_interface_1.ZipJobStatus.PROCESSING);
            const files = await this.getFilesFromFolder(job.folderId);
            job.totalFiles = files.length;
            await this.updateJob(job);
            const zipId = Date.now().toString();
            const cacheKey = `zip:${zipId}`;
            const cachedPath = await this.cacheManager.get(cacheKey);
            if (cachedPath) {
                await this.updateJobStatus(job.jobId, zip_interface_1.ZipJobStatus.COMPLETED, undefined, cachedPath);
                return;
            }
            const zipFileName = `${zipId}.zip`;
            const zipFilePath = `/tmp/${zipFileName}`;
            const output = (0, fs_1.createWriteStream)(zipFilePath);
            const archive = (0, archiver_1.default)('zip', { zlib: { level: 6 } });
            archive.pipe(output);
            archive.on('error', (err) => {
                throw new Error(`Archive error: ${err.message}`);
            });
            const limit = (0, p_limit_1.default)(this.CONCURRENT_DOWNLOADS);
            const downloads = files.map((file) => limit(async () => {
                try {
                    const stream = await this.downloadFile(file.url);
                    archive.append(stream, { name: file.name });
                    job.processedFiles++;
                    job.progress = Math.round((job.processedFiles / job.totalFiles) * 100);
                    await this.updateJob(job);
                }
                catch (error) {
                    this.logger.error(`Error processing file ${file.name}: ${error.message}`);
                }
            }));
            await Promise.all(downloads);
            await archive.finalize();
            await this.cacheManager.set(cacheKey, zipFilePath, 3600);
            const url = await this.generatePresignedUrl(`zips/${job.jobId}.zip`);
            await this.updateJobStatus(job.jobId, zip_interface_1.ZipJobStatus.COMPLETED, undefined, url);
        }
        catch (error) {
            await this.updateJobStatus(job.jobId, zip_interface_1.ZipJobStatus.FAILED, error.message);
            throw error;
        }
    }
    async downloadFile(url) {
        try {
            const response = await (0, axios_1.default)({
                method: 'GET',
                url,
                responseType: 'stream',
                timeout: 30000
            });
            return response.data;
        }
        catch (error) {
            throw new Error(`Download failed: ${error.message}`);
        }
    }
    async getJobStatus(jobId) {
        const jobData = await this.cacheManager.get(`zip:${jobId}`);
        return jobData ? JSON.parse(jobData) : null;
    }
    async updateJob(job) {
        await this.cacheManager.set(`zip:${job.jobId}`, JSON.stringify(job), this.ZIP_EXPIRY_HOURS * 3600);
    }
    async updateJobStatus(jobId, status, error, url) {
        const job = await this.getJobStatus(jobId);
        if (!job)
            return;
        job.status = status;
        if (error)
            job.error = error;
        if (url)
            job.url = url;
        await this.updateJob(job);
    }
    async generatePresignedUrl(key) {
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Expires: 3600,
        };
        return this.s3.getSignedUrlPromise('getObject', params);
    }
    async getFilesFromFolder(folderId) {
        return [
            { name: 'file1.jpg', url: 'https://example.com/file1.jpg' },
            { name: 'file2.jpg', url: 'https://example.com/file2.jpg' },
        ];
    }
};
ZipService = ZipService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], ZipService);
exports.ZipService = ZipService;
//# sourceMappingURL=zip.service.js.map