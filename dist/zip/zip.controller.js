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
var ZipController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipController = void 0;
const common_1 = require("@nestjs/common");
const enhanced_zip_service_1 = require("./enhanced-zip.service");
const zip_request_dto_1 = require("./dto/zip-request.dto");
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
    constructor(zipService) {
        this.zipService = zipService;
        this.logger = new common_1.Logger(ZipController_1.name);
    }
    async createZip(zipRequest, res) {
        try {
            const userId = 'default-user';
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
};
exports.ZipController = ZipController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [zip_request_dto_1.ZipRequestDto, Object]),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "createZip", null);
exports.ZipController = ZipController = ZipController_1 = __decorate([
    (0, common_1.Controller)('zip'),
    __metadata("design:paramtypes", [enhanced_zip_service_1.EnhancedZipService])
], ZipController);
//# sourceMappingURL=zip.controller.js.map