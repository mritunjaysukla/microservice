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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ZipController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipController = void 0;
const common_1 = require("@nestjs/common");
const enhanced_zip_service_1 = require("./enhanced-zip.service");
const zip_queue_service_1 = require("./queue/zip-queue.service");
const zip_request_dto_1 = require("./dto/zip-request.dto");
const ioredis_1 = __importDefault(require("ioredis"));
function ensureError(error) {
    if (error instanceof Error)
        return error;
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return new Error(error.message);
    }
    if (typeof error === 'string')
        return new Error(error);
    return new Error(`Unknown error: ${JSON.stringify(error)}`);
}
let ZipController = ZipController_1 = class ZipController {
    constructor(zipService, zipQueueService) {
        this.zipService = zipService;
        this.zipQueueService = zipQueueService;
        this.logger = new common_1.Logger(ZipController_1.name);
        this.redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        });
    }
    async createZip(zipRequest, res, userId = 'anonymous') {
        try {
            await this.zipService.archiveAndStreamZip(zipRequest, res, userId);
        }
        catch (error) {
            const safeError = ensureError(error);
            this.logger.error(`Controller error: ${safeError.message}`, safeError.stack);
            if (!res.headersSent) {
                res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                    error: 'Unhandled controller error',
                    message: safeError.message,
                });
            }
        }
    }
    async downloadZip(jobId, res) {
        try {
            const fs = require('fs');
            const metaKey = `zip:meta:${jobId}`;
            const metaData = await this.redis.get(metaKey);
            if (!metaData) {
                return res.status(404).json({ error: 'Zip file not found or expired' });
            }
            const meta = JSON.parse(metaData);
            if (meta.status === 'failed') {
                return res.status(500).json({ error: 'Zip creation failed', message: meta.error });
            }
            if (meta.status !== 'completed') {
                return res.status(202).json({ status: meta.status, message: 'Zip is still processing' });
            }
            if (!fs.existsSync(meta.filePath)) {
                return res.status(404).json({ error: 'Zip file has been cleaned up or expired' });
            }
            const fileName = meta.fileName || 'archive.zip';
            const fileSize = meta.size;
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
            res.setHeader('Content-Length', fileSize);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            const fileStream = fs.createReadStream(meta.filePath);
            fileStream.pipe(res);
            fileStream.on('error', (error) => {
                this.logger.error(`Error streaming file: ${error.message}`);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to stream zip file' });
                }
            });
        }
        catch (error) {
            console.error('Download error:', error);
            res.status(500).json({ error: 'Failed to download zip file' });
        }
    }
    async getZipStatus(jobId) {
        try {
            const cacheKey = `zip:download:${jobId}`;
            const exists = await this.redis.exists(cacheKey);
            if (exists) {
                const metaKey = `zip:meta:${jobId}`;
                const metaData = await this.redis.get(metaKey);
                if (metaData) {
                    const meta = JSON.parse(metaData);
                    return {
                        status: meta.status,
                        downloadUrl: meta.status === 'completed' ? `/zip/download/${jobId}` : null,
                        fileName: meta.fileName,
                        size: meta.size,
                        createdAt: meta.createdAt,
                        error: meta.error
                    };
                }
            }
            const jobStatus = await this.zipQueueService.getJobStatus(jobId);
            return jobStatus;
        }
        catch (error) {
            return { status: 'error', message: error.message };
        }
    }
};
exports.ZipController = ZipController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Headers)('user-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [zip_request_dto_1.ZipRequestDto, Object, String]),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "createZip", null);
__decorate([
    (0, common_1.Get)('download/:jobId'),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "downloadZip", null);
__decorate([
    (0, common_1.Get)('status/:jobId'),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "getZipStatus", null);
exports.ZipController = ZipController = ZipController_1 = __decorate([
    (0, common_1.Controller)('zip'),
    __metadata("design:paramtypes", [enhanced_zip_service_1.EnhancedZipService,
        zip_queue_service_1.ZipQueueService])
], ZipController);
//# sourceMappingURL=zip.controller.js.map