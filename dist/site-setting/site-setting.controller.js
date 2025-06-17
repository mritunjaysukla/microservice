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
exports.SiteSettingController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const site_setting_service_1 = require("./site-setting.service");
const create_site_setting_dto_1 = require("./dto/create-site-setting.dto");
const auth_decorator_1 = require("src/common/decorator/auth.decorator");
const add_brand_settings_dto_1 = require("./dto/add-brand-settings.dto");
const update_brand_settings_dto_1 = require("./dto/update-brand-settings.dto");
const add_socials_dto_1 = require("./dto/add-socials.dto");
const add_photographer_stats_dto_1 = require("./dto/add-photographer-stats.dto");
const user_agreement_dto_1 = require("./dto/user-agreement.dto");
const legal_agreement_dto_1 = require("./dto/legal-agreement.dto");
const update_watermark_dto_1 = require("./dto/update-watermark.dto");
let SiteSettingController = class SiteSettingController {
    constructor(siteSettingService) {
        this.siteSettingService = siteSettingService;
    }
    async addBrandSettings(req, addBrandSettingsDto, brandLogo) {
        const userId = req.user.id;
        return this.siteSettingService.addBrandSettings(userId, addBrandSettingsDto, brandLogo);
    }
    async updateBrandSettings(req, updateBrandSettingsDto, brandLogo) {
        const userId = req.user.id;
        return this.siteSettingService.updateBrandSettings(userId, updateBrandSettingsDto, brandLogo);
    }
    async addSocials(req, addSocialsDto) {
        const userId = req.user.id;
        return this.siteSettingService.addSocials(userId, addSocialsDto);
    }
    async updateLegalAgreement(req, legalAgreementDto) {
        return this.siteSettingService.updateLegalAgreement(req.user.id, legalAgreementDto);
    }
    async updateUserAgreement(req, userAgreementDto) {
        console.log('userAgreementDto', req.user?.id);
        return this.siteSettingService.updateUserAgreement(req.user.id, userAgreementDto);
    }
    async addStats(req, addPhotographerStatsDto) {
        const userId = req.user.id;
        return this.siteSettingService.addStats(userId, addPhotographerStatsDto);
    }
    async updateWatermark(userId, options) {
        return this.siteSettingService.updateWatermark(userId, options);
    }
    async createSiteSetting(userId, createSiteSettingDto) {
        return this.siteSettingService.createSiteSetting(userId, createSiteSettingDto);
    }
    async getSiteSettings(req) {
        const userId = req.user.id;
        return this.siteSettingService.getSiteSettings(userId);
    }
    async getSiteSettingsBySubdomain(subdomain) {
        return this.siteSettingService.getSiteSettingsBySubdomain(subdomain);
    }
    async getBrandSettings(req) {
        return this.siteSettingService.getBrandSettings(req.user.id);
    }
    async getSocialLinks(req) {
        return this.siteSettingService.getSocialLinks(req.user.id);
    }
    async getStats(req) {
        return this.siteSettingService.getStats(req.user.id);
    }
    async getWatermark(req) {
        return this.siteSettingService.getWatermark(req.user.id);
    }
    async getUserAgreement(req) {
        return this.siteSettingService.getUserAgreement(req.user.id);
    }
    async getLegalAgreement(req) {
        return this.siteSettingService.getLegalAgreement(req.user.id);
    }
    async publishUserAgreement(id) {
        return this.siteSettingService.publishUserAgreement(id);
    }
    async updatePortfolioCoverImage(portfolioCoverImg, req) {
        const user = req.user;
        return this.siteSettingService.updatePortfolioCoverImg(portfolioCoverImg, user);
    }
};
__decorate([
    (0, common_1.Post)('brand-settings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBody)({ type: add_brand_settings_dto_1.AddBrandSettingsDto }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('brandLogo')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.FileTypeValidator({ fileType: '.(jpg|jpeg|png)' }),
            new common_1.MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }),
        ],
        fileIsRequired: false,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_brand_settings_dto_1.AddBrandSettingsDto, Object]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "addBrandSettings", null);
__decorate([
    (0, common_1.Patch)('brand-settings'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBody)({ type: update_brand_settings_dto_1.UpdateBrandSettingsDto }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('brandLogo')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.FileTypeValidator({ fileType: '.(jpg|jpeg|png)' }),
            new common_1.MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }),
        ],
        fileIsRequired: false,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_brand_settings_dto_1.UpdateBrandSettingsDto, Object]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "updateBrandSettings", null);
__decorate([
    (0, common_1.Post)('socials'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_socials_dto_1.AddSocialsDto]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "addSocials", null);
__decorate([
    (0, common_1.Post)('legal-agreement'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, legal_agreement_dto_1.LegalAgreementDto]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "updateLegalAgreement", null);
__decorate([
    (0, common_1.Post)('/user-agreement'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, user_agreement_dto_1.UserAgreementDto]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "updateUserAgreement", null);
__decorate([
    (0, common_1.Post)('stats'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, add_photographer_stats_dto_1.AddPhotographerStatsDto]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "addStats", null);
__decorate([
    (0, common_1.Patch)(':userId/watermark'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_watermark_dto_1.WatermarkOptionsDto]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "updateWatermark", null);
__decorate([
    (0, common_1.Post)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_site_setting_dto_1.CreateSiteSettingDto]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "createSiteSetting", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "getSiteSettings", null);
__decorate([
    (0, common_1.Get)('subdomain/:subdomain'),
    __param(0, (0, common_1.Param)('subdomain')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "getSiteSettingsBySubdomain", null);
__decorate([
    (0, common_1.Get)('brand'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "getBrandSettings", null);
__decorate([
    (0, common_1.Get)('social'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "getSocialLinks", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('watermark'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "getWatermark", null);
__decorate([
    (0, common_1.Get)('user-agreement'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "getUserAgreement", null);
__decorate([
    (0, common_1.Get)('legal-agreement'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "getLegalAgreement", null);
__decorate([
    (0, common_1.Patch)('user-agreement/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "publishUserAgreement", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)('siteCover'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('portfolioCoverImg')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                portfolioCoverImg: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SiteSettingController.prototype, "updatePortfolioCoverImage", null);
SiteSettingController = __decorate([
    (0, swagger_1.ApiTags)('Site Settings'),
    (0, common_1.Controller)('site-settings'),
    __metadata("design:paramtypes", [site_setting_service_1.SiteSettingService])
], SiteSettingController);
exports.SiteSettingController = SiteSettingController;
//# sourceMappingURL=site-setting.controller.js.map