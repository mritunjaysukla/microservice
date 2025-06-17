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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGallerySetting = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const swagger_1 = require("@nestjs/swagger");
const create_gallery_setting_dto_1 = require("./create-gallery-setting.dto");
const gallery_setting_entity_1 = require("../entity/gallery-setting.entity");
const class_validator_1 = require("class-validator");
class UpdateGallerySetting extends (0, mapped_types_1.PartialType)(create_gallery_setting_dto_1.CreateGallerySettingDto) {
}
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Updated project header (optional)',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGallerySetting.prototype, "projectHeader", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        description: 'Updated project description (optional)',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGallerySetting.prototype, "projectDescription", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(gallery_setting_entity_1.Fonts),
    __metadata("design:type", String)
], UpdateGallerySetting.prototype, "primaryFonts", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(gallery_setting_entity_1.Fonts),
    __metadata("design:type", String)
], UpdateGallerySetting.prototype, "secondaryFonts", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        enum: gallery_setting_entity_1.PhotoLayout,
        description: 'Updated photo layout (optional)',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGallerySetting.prototype, "photoLayout", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        enum: gallery_setting_entity_1.MenuIcon,
        description: 'Updated menu icon (optional)',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGallerySetting.prototype, "menuIcon", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        enum: gallery_setting_entity_1.ImageGap,
        description: 'Updated image gap (optional)',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGallerySetting.prototype, "imageGap", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        required: false,
        enum: gallery_setting_entity_1.ColorSchema,
        description: 'Updated color schema (optional)',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGallerySetting.prototype, "colorSchema", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: 'string', format: 'binary', required: false }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateGallerySetting.prototype, "projectCover", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(gallery_setting_entity_1.GalleryHomePageLayout),
    __metadata("design:type", String)
], UpdateGallerySetting.prototype, "galeryHomePageLayout", void 0);
exports.UpdateGallerySetting = UpdateGallerySetting;
//# sourceMappingURL=update-gallery-setting.dto.js.map