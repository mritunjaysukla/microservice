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
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProjectWithSettingDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const gallery_setting_entity_1 = require("src/gallery-setting/entity/gallery-setting.entity");
const project_entity_1 = require("../entities/project.entity");
class CreateProjectWithSettingDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateProjectWithSettingDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectWithSettingDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreateProjectWithSettingDto.prototype, "dateCompleted", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreateProjectWithSettingDto.prototype, "shootDate", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(project_entity_1.ProjectType),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectWithSettingDto.prototype, "projectType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_transformer_1.Transform)(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            }
            catch (e) {
                return [value];
            }
        }
        return value;
    }),
    (0, class_validator_1.IsUUID)('4', { each: true }),
    __metadata("design:type", Array)
], CreateProjectWithSettingDto.prototype, "addedProducts", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectWithSettingDto.prototype, "storageType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateProjectWithSettingDto.prototype, "timeline", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateProjectWithSettingDto.prototype, "photoSelection", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateProjectWithSettingDto.prototype, "downloadOriginalPhotos", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateProjectWithSettingDto.prototype, "watermark", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateProjectWithSettingDto.prototype, "showProduct", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateProjectWithSettingDto.prototype, "allowFeedback", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateProjectWithSettingDto.prototype, "requireCredentials", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateProjectWithSettingDto.prototype, "displayShareBtn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateProjectWithSettingDto.prototype, "displayContactInfo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateProjectWithSettingDto.prototype, "displayBusinessCard", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateProjectWithSettingDto.prototype, "displayTestimonials", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateProjectWithSettingDto.prototype, "requirePassword", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectWithSettingDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateProjectWithSettingDto.prototype, "projectHeader", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateProjectWithSettingDto.prototype, "projectDescription", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(gallery_setting_entity_1.Fonts),
    __metadata("design:type", typeof (_a = typeof gallery_setting_entity_1.Fonts !== "undefined" && gallery_setting_entity_1.Fonts) === "function" ? _a : Object)
], CreateProjectWithSettingDto.prototype, "primaryFonts", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(gallery_setting_entity_1.Fonts),
    __metadata("design:type", typeof (_b = typeof gallery_setting_entity_1.Fonts !== "undefined" && gallery_setting_entity_1.Fonts) === "function" ? _b : Object)
], CreateProjectWithSettingDto.prototype, "secondaryFonts", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(gallery_setting_entity_1.PhotoLayout),
    __metadata("design:type", typeof (_c = typeof gallery_setting_entity_1.PhotoLayout !== "undefined" && gallery_setting_entity_1.PhotoLayout) === "function" ? _c : Object)
], CreateProjectWithSettingDto.prototype, "photoLayout", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(gallery_setting_entity_1.MenuIcon),
    __metadata("design:type", typeof (_d = typeof gallery_setting_entity_1.MenuIcon !== "undefined" && gallery_setting_entity_1.MenuIcon) === "function" ? _d : Object)
], CreateProjectWithSettingDto.prototype, "menuIcon", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(gallery_setting_entity_1.ImageGap),
    __metadata("design:type", typeof (_e = typeof gallery_setting_entity_1.ImageGap !== "undefined" && gallery_setting_entity_1.ImageGap) === "function" ? _e : Object)
], CreateProjectWithSettingDto.prototype, "imageGap", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(gallery_setting_entity_1.ColorSchema),
    __metadata("design:type", typeof (_f = typeof gallery_setting_entity_1.ColorSchema !== "undefined" && gallery_setting_entity_1.ColorSchema) === "function" ? _f : Object)
], CreateProjectWithSettingDto.prototype, "colorSchema", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectWithSettingDto.prototype, "coverPhoto", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProjectWithSettingDto.prototype, "siteCover", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(gallery_setting_entity_1.GalleryHomePageLayout),
    __metadata("design:type", typeof (_g = typeof gallery_setting_entity_1.GalleryHomePageLayout !== "undefined" && gallery_setting_entity_1.GalleryHomePageLayout) === "function" ? _g : Object)
], CreateProjectWithSettingDto.prototype, "galeryHomePageLayout", void 0);
exports.CreateProjectWithSettingDto = CreateProjectWithSettingDto;
//# sourceMappingURL=create-project-with-setting.dto.js.map