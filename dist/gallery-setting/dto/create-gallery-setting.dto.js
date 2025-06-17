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
exports.CreateGallerySettingDto = void 0;
const class_validator_1 = require("class-validator");
const gallery_setting_entity_1 = require("../entity/gallery-setting.entity");
class CreateGallerySettingDto {
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGallerySettingDto.prototype, "projectHeader", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGallerySettingDto.prototype, "projectDescription", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(gallery_setting_entity_1.Fonts),
    __metadata("design:type", String)
], CreateGallerySettingDto.prototype, "primaryFonts", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(gallery_setting_entity_1.Fonts),
    __metadata("design:type", String)
], CreateGallerySettingDto.prototype, "secondaryFonts", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(gallery_setting_entity_1.PhotoLayout),
    __metadata("design:type", String)
], CreateGallerySettingDto.prototype, "photoLayout", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(gallery_setting_entity_1.MenuIcon),
    __metadata("design:type", String)
], CreateGallerySettingDto.prototype, "menuIcon", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(gallery_setting_entity_1.ImageGap),
    __metadata("design:type", String)
], CreateGallerySettingDto.prototype, "imageGap", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(gallery_setting_entity_1.ColorSchema),
    __metadata("design:type", String)
], CreateGallerySettingDto.prototype, "colorSchema", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateGallerySettingDto.prototype, "projectId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(gallery_setting_entity_1.GalleryHomePageLayout),
    __metadata("design:type", String)
], CreateGallerySettingDto.prototype, "galeryHomePageLayout", void 0);
exports.CreateGallerySettingDto = CreateGallerySettingDto;
//# sourceMappingURL=create-gallery-setting.dto.js.map