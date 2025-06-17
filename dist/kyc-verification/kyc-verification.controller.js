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
exports.KycVerificationController = void 0;
const common_1 = require("@nestjs/common");
const kyc_verification_service_1 = require("./kyc-verification.service");
const kyc_user_entity_1 = require("./entity/kyc-user.entity");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const update_kyc_admin_dto_1 = require("./dto/update-kyc-admin.dto");
let KycVerificationController = class KycVerificationController {
    constructor(kycUserService) {
        this.kycUserService = kycUserService;
    }
    async getUserKycByuserId(userId) {
        console.log('getUserKycByuserId');
        console.log('getUserKycByuserId', userId);
        return await this.kycUserService.getUserKyc(userId);
    }
    async updateKycStatus(kycId) {
        return await this.kycUserService.submitKyc(kycId);
    }
    async getUserKyc(userId) {
        return await this.kycUserService.getUserKyc(userId);
    }
    async submitKycInfo(id, fieldName, dto, files) {
        const file1 = files.file1?.[0];
        const file2 = files.file2?.[0];
        return await this.kycUserService.submitKycField(id, fieldName, dto, file1, file2);
    }
    async updateAdminRemarkAndKycStatus(id, kycStatus, adminRemarks) {
        try {
            const updatedKyc = await this.kycUserService.updateAdminRemarkAndKycStatus(id, kycStatus, adminRemarks);
            return { message: 'KYC updated successfully', data: updatedKyc };
        }
        catch (error) {
            if (error.message === 'userkyc not found') {
                throw new common_1.NotFoundException('KYC record not found');
            }
            throw error;
        }
    }
    async getKycByStatus(status, page, limit) {
        const pageNumber = parseInt(page, 10) || 1;
        const limitNumber = parseInt(limit, 10) || 10;
        return this.kycUserService.getAllKycByStatus(status, pageNumber, limitNumber);
    }
};
__decorate([
    (0, swagger_1.ApiParam)({ name: 'userid', description: 'User ID' }),
    (0, common_1.Get)('user/:userid'),
    __param(0, (0, common_1.Param)('userid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KycVerificationController.prototype, "getUserKycByuserId", null);
__decorate([
    (0, common_1.Patch)('submitted/:kycId'),
    __param(0, (0, common_1.Param)('kycId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KycVerificationController.prototype, "updateKycStatus", null);
__decorate([
    (0, swagger_1.ApiParam)({ name: 'userid', description: 'User ID' }),
    (0, common_1.Get)(':userid'),
    __param(0, (0, common_1.Param)('userid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KycVerificationController.prototype, "getUserKyc", null);
__decorate([
    (0, swagger_1.ApiParam)({
        name: 'fieldName',
        enum: [
            'basicInformation',
            'businessInformation',
            'identityVerification',
            'termsAndSubmission',
        ],
        required: true,
        description: 'The field of the KYC form to update',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        type: String,
        required: true,
        description: 'User ID',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                dto: {
                    type: 'object',
                    additionalProperties: true,
                    description: 'Dynamic DTO depending on the fieldName',
                },
                file1: {
                    type: 'string',
                    format: 'binary',
                },
                file2: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, common_1.Patch)('submit-info/:fieldName/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'file1', maxCount: 1 },
        { name: 'file2', maxCount: 1 },
    ])),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('fieldName', new common_1.ParseEnumPipe(kyc_user_entity_1.ValidFields))),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], KycVerificationController.prototype, "submitKycInfo", null);
__decorate([
    (0, swagger_1.ApiParam)({ name: 'id', description: 'KYC ID' }),
    (0, swagger_1.ApiBody)({ type: update_kyc_admin_dto_1.UpdateKycAdminDto }),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('kycStatus')),
    __param(2, (0, common_1.Body)('adminRemarks')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], KycVerificationController.prototype, "updateAdminRemarkAndKycStatus", null);
__decorate([
    (0, common_1.Get)('status/:status'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], KycVerificationController.prototype, "getKycByStatus", null);
KycVerificationController = __decorate([
    (0, swagger_1.ApiTags)('KYC Verification'),
    (0, common_1.Controller)('kyc-verification'),
    __metadata("design:paramtypes", [kyc_verification_service_1.KycVerificationService])
], KycVerificationController);
exports.KycVerificationController = KycVerificationController;
//# sourceMappingURL=kyc-verification.controller.js.map