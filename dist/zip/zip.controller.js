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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipController = void 0;
const common_1 = require("@nestjs/common");
const zip_service_1 = require("./zip.service");
const zip_request_dto_1 = require("./dto/zip-request.dto");
const swagger_1 = require("@nestjs/swagger");
let ZipController = class ZipController {
    constructor(zipService) {
        this.zipService = zipService;
    }
    async createZip(dto, res) {
        return this.zipService.archiveAndStreamZip(dto, res);
    }
    async createZipJob(dto) {
        const jobId = await this.zipService.createZipJob(dto);
        return { jobId };
    }
    async getStatus(jobId) {
        const status = await this.zipService.getJobStatus(jobId);
        if (status.status === 'not_found') {
            throw new common_1.HttpException('Job not found', common_1.HttpStatus.NOT_FOUND);
        }
        return status;
    }
    async downloadZip(jobId, res) {
        await this.zipService.downloadZip(jobId, res);
    }
};
exports.ZipController = ZipController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a zip from S3 folder contents (sync)' }),
    (0, swagger_1.ApiBody)({ type: zip_request_dto_1.ZipRequestDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Zip created and streamed successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad Request' }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Server Error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [zip_request_dto_1.ZipRequestDto, Object]),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "createZip", null);
__decorate([
    (0, common_1.Post)('job'),
    (0, swagger_1.ApiOperation)({ summary: 'Create zip job for async processing' }),
    (0, swagger_1.ApiBody)({ type: zip_request_dto_1.ZipRequestDto }),
    (0, swagger_1.ApiResponse)({ status: 202, description: 'Zip job created' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [zip_request_dto_1.ZipRequestDto]),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "createZipJob", null);
__decorate([
    (0, common_1.Get)('job/status/:jobId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get status of zip job' }),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('job/download/:jobId'),
    (0, swagger_1.ApiOperation)({ summary: 'Download zip file for completed job' }),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "downloadZip", null);
exports.ZipController = ZipController = __decorate([
    (0, swagger_1.ApiTags)('Zip'),
    (0, common_1.Controller)('zip'),
    __metadata("design:paramtypes", [zip_service_1.ZipService])
], ZipController);
//# sourceMappingURL=zip.controller.js.map