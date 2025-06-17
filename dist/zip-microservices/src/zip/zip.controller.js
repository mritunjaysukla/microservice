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
const microservices_1 = require("@nestjs/microservices");
const zip_service_1 = require("./zip.service");
const zip_dto_1 = require("./dto/zip.dto");
let ZipController = class ZipController {
    constructor(zipService) {
        this.zipService = zipService;
    }
    async handleCreateZip(data) {
        const jobId = await this.zipService.processZipRequest(data);
        return { jobId };
    }
    async handleGetZipStatus(payload) {
        const job = await this.zipService.getJobStatus(payload.jobId);
        if (!job) {
            return {
                status: 'not_found',
                message: `No job found with ID ${payload.jobId}`
            };
        }
        return {
            status: job.status,
            progress: job.progress,
            url: job.url,
            error: job.error
        };
    }
};
__decorate([
    (0, microservices_1.MessagePattern)('zip:create'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [zip_dto_1.ZipJobDto]),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "handleCreateZip", null);
__decorate([
    (0, microservices_1.MessagePattern)('zip:status'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "handleGetZipStatus", null);
ZipController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [zip_service_1.ZipService])
], ZipController);
exports.ZipController = ZipController;
//# sourceMappingURL=zip.controller.js.map