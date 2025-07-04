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
const client_s3_1 = require("@aws-sdk/client-s3");
const ioredis_1 = require("ioredis");
const piscina_1 = require("piscina");
const path = require("path");
const fs = require("fs");
const uuid_1 = require("uuid");
let ZipService = ZipService_1 = class ZipService {
    constructor() {
        this.logger = new common_1.Logger(ZipService_1.name);
        this.redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        });
        this.s3Client = new client_s3_1.S3Client({
            region: process.env.S3_REGION || 'custom-region',
            endpoint: process.env.S3_ENDPOINT,
            forcePathStyle: true,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY,
            },
        });
    }
    onModuleInit() {
        const workerPath = path.resolve(__dirname, './workers/zip-worker.js');
        const tsWorkerPath = path.resolve(__dirname, './workers/zip-worker.ts');
        this.piscina = new piscina_1.Piscina({
            filename: fs.existsSync(workerPath) ? workerPath : tsWorkerPath,
            maxThreads: parseInt(process.env.ZIP_MAX_THREADS || '4'),
            minThreads: parseInt(process.env.ZIP_MIN_THREADS || '2'),
            idleTimeout: 60000,
            maxQueue: 50,
            execArgv: fs.existsSync(workerPath) ? [] : ['-r', 'ts-node/register'],
        });
        this.logger.log(`Worker pool initialized: ${this.piscina.threads.length} threads`);
    }
    onModuleDestroy() {
        this.redis.disconnect();
        if (this.piscina) {
            this.piscina.destroy();
        }
    }
    async archiveAndStreamZip(dto, res) {
        const { fileUrls, zipFileName } = dto;
        if (!fileUrls || fileUrls.length === 0) {
            throw new Error('No file URLs provided');
        }
        const jobId = `zip-${(0, uuid_1.v4)()}`;
        this.logger.log(`Starting zip job ${jobId} for ${fileUrls.length} files`);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipFileName || 'archive.zip'}"`);
        try {
            const result = await this.piscina.run({
                fileUrls: fileUrls,
                zipFileName: zipFileName || 'archive.zip',
                jobId: jobId
            });
            if (!result || !result.filePath || !fs.existsSync(result.filePath)) {
                throw new Error('Failed to create zip file');
            }
            this.logger.log(`Zip created: ${result.filePath} (${this.formatFileSize(result.fileSize)})`);
            const stats = fs.statSync(result.filePath);
            res.setHeader('Content-Length', stats.size.toString());
            const readStream = fs.createReadStream(result.filePath);
            readStream.on('error', (error) => {
                this.logger.error(`Stream error for job ${jobId}:`, error);
                this.cleanupTempFile(result.filePath);
            });
            readStream.on('end', () => {
                this.logger.log(`Streaming completed for job ${jobId}`);
                this.cleanupTempFile(result.filePath);
            });
            readStream.pipe(res);
        }
        catch (error) {
            this.logger.error(`Error during zip creation for job ${jobId}:`, error);
            if (!res.headersSent) {
                res.status(500).send('Error creating ZIP archive');
            }
        }
    }
    cleanupTempFile(filePath) {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    this.logger.error(`Failed to delete temp file: ${filePath}`, err);
                }
                else {
                    this.logger.log(`Cleaned up temp file: ${filePath}`);
                }
            });
        }
    }
    formatFileSize(bytes) {
        if (bytes === 0)
            return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
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