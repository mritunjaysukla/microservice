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
const enhanced_zip_service_1 = require("./enhanced-zip.service");
const zip_request_dto_1 = require("./dto/zip-request.dto");
const passport_1 = require("@nestjs/passport");
let ZipController = class ZipController {
    constructor(zipService) {
        this.zipService = zipService;
    }
    async createZip(zipRequest, res, req) {
        return this.zipService.archiveAndStreamZip(zipRequest, res, req.user.id);
    }
};
exports.ZipController = ZipController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [zip_request_dto_1.ZipRequestDto, Object, Object]),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "createZip", null);
exports.ZipController = ZipController = __decorate([
    (0, common_1.Controller)('zip'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [enhanced_zip_service_1.EnhancedZipService])
], ZipController);
//# sourceMappingURL=zip.controller.js.map