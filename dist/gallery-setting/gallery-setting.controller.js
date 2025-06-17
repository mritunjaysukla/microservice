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
exports.GallerySettingController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const gallery_setting_service_1 = require("./gallery-setting.service");
const create_gallery_setting_dto_1 = require("./dto/create-gallery-setting.dto");
const gallery_setting_entity_1 = require("./entity/gallery-setting.entity");
const auth_decorator_1 = require("src/common/decorator/auth.decorator");
const update_gallery_setting_dto_1 = require("./dto/update-gallery-setting.dto");
let GallerySettingController = class GallerySettingController {
    constructor(gallerySettingService) {
        this.gallerySettingService = gallerySettingService;
    }
    async create(createGallerySettingDto, projectCover, req) {
        const userId = req.user.id;
        return this.gallerySettingService.create(createGallerySettingDto, userId, projectCover);
    }
    async findOneGallerySeetingByProjectId(projectId) {
        return this.gallerySettingService.findOneSettingByProjectId(projectId);
    }
    async updateGallerySetting(projectId, updateGallerySettingDto, projectCover) {
        return this.gallerySettingService.updateGallerySetting(projectId, updateGallerySettingDto, projectCover);
    }
};
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    (0, common_1.Post)(''),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('projectCover')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                projectCover: {
                    type: 'string',
                    format: 'binary',
                },
                projectHeader: { type: 'string' },
                projectDescription: { type: 'string' },
                fonts: {
                    type: 'string',
                    enum: Object.values(gallery_setting_entity_1.Fonts),
                },
                photoLayout: {
                    type: 'string',
                    enum: Object.values(gallery_setting_entity_1.PhotoLayout),
                },
                galeryHomePageLayout: {
                    type: 'string',
                    enum: Object.values(gallery_setting_entity_1.GalleryHomePageLayout),
                },
                menuIcon: { type: 'string', enum: Object.values(gallery_setting_entity_1.MenuIcon) },
                imageGap: { type: 'string', enum: Object.values(gallery_setting_entity_1.ImageGap) },
                colorSchema: {
                    type: 'string',
                    enum: Object.values(gallery_setting_entity_1.ColorSchema),
                },
                projectId: { type: 'string', format: 'uuid' },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_gallery_setting_dto_1.CreateGallerySettingDto, Object, Object]),
    __metadata("design:returntype", Promise)
], GallerySettingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GallerySettingController.prototype, "findOneGallerySeetingByProjectId", null);
__decorate([
    (0, common_1.Patch)(':projectId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('projectCover')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Update Gallery Setting with project cover image',
        type: update_gallery_setting_dto_1.UpdateGallerySetting,
        required: false,
    }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_gallery_setting_dto_1.UpdateGallerySetting, Object]),
    __metadata("design:returntype", Promise)
], GallerySettingController.prototype, "updateGallerySetting", null);
GallerySettingController = __decorate([
    (0, swagger_1.ApiTags)('Gallery-setting'),
    (0, common_1.Controller)('gallery-setting'),
    __metadata("design:paramtypes", [gallery_setting_service_1.GallerySettingService])
], GallerySettingController);
exports.GallerySettingController = GallerySettingController;
//# sourceMappingURL=gallery-setting.controller.js.map