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
exports.GallerySetting = exports.GalleryHomePageLayout = exports.ColorSchema = exports.ImageGap = exports.MenuIcon = exports.PhotoLayout = exports.Fonts = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("../../project/entities/project.entity");
const typeorm_2 = require("typeorm");
var Fonts;
(function (Fonts) {
    Fonts["ROSCA"] = "rosca";
    Fonts["MOONET"] = "moonet";
    Fonts["MOCADS"] = "mocads";
    Fonts["BALGERI"] = "balgeri";
    Fonts["BEYOND_MARS"] = "beyond-mars";
    Fonts["GODBER"] = "godber";
    Fonts["AMOROUS"] = "amorous";
    Fonts["GARIS"] = "garis";
    Fonts["LOMBARD"] = "lombard";
    Fonts["SINORETA"] = "sinoreta";
    Fonts["GAUTER"] = "gauter";
    Fonts["MALLISY"] = "mallisy";
    Fonts["HENDRIGO"] = "hendrigo";
    Fonts["TIARA"] = "tiara";
    Fonts["BLACKSWORD"] = "blacksword";
    Fonts["LATIN_STUDY"] = "latin-study";
    Fonts["CLATTERING"] = "clattering";
    Fonts["SAMARKAN"] = "samarkan";
    Fonts["QLASSY"] = "qlassy";
    Fonts["TAKOTA"] = "takota";
    Fonts["WARSASW"] = "warsasw";
    Fonts["MONTSERRAT"] = "montserrat";
    Fonts["ARIAL"] = "arial";
    Fonts["FIGMA_HANDLE"] = "figma_hand";
    Fonts["ROBOTO"] = "roboto";
})(Fonts = exports.Fonts || (exports.Fonts = {}));
var PhotoLayout;
(function (PhotoLayout) {
    PhotoLayout["GRID_LAYOUT"] = "grid-layout";
    PhotoLayout["PINTEREST_LAYOUT"] = "pinterest-layout";
})(PhotoLayout = exports.PhotoLayout || (exports.PhotoLayout = {}));
var MenuIcon;
(function (MenuIcon) {
    MenuIcon["FILLED"] = "filled";
    MenuIcon["DARK"] = "dark";
    MenuIcon["OUTLINED"] = "outlined";
})(MenuIcon = exports.MenuIcon || (exports.MenuIcon = {}));
var ImageGap;
(function (ImageGap) {
    ImageGap["SMALL"] = "16px";
    ImageGap["MEDIUM"] = "32px";
    ImageGap["LARGE"] = "48px";
})(ImageGap = exports.ImageGap || (exports.ImageGap = {}));
var ColorSchema;
(function (ColorSchema) {
    ColorSchema["DARK"] = "#1A0000";
    ColorSchema["LIGHT"] = "#ECECEC";
    ColorSchema["DARK_LIGHT"] = "#767676";
    ColorSchema["PINK"] = "#F5E3E4";
})(ColorSchema = exports.ColorSchema || (exports.ColorSchema = {}));
var GalleryHomePageLayout;
(function (GalleryHomePageLayout) {
    GalleryHomePageLayout["SPLIT_SCREEN"] = "split-screen";
    GalleryHomePageLayout["OVERLAY_TEXT"] = "overlay-text";
    GalleryHomePageLayout["FLIPSPLIT_SCREEN"] = "flip-split-screen";
})(GalleryHomePageLayout = exports.GalleryHomePageLayout || (exports.GalleryHomePageLayout = {}));
let GallerySetting = class GallerySetting {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], GallerySetting.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Fotofolio Gallery' }),
    __metadata("design:type", String)
], GallerySetting.prototype, "projectHeader", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'This is a Fotofolio Gallery' }),
    __metadata("design:type", String)
], GallerySetting.prototype, "projectDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Fonts,
        default: Fonts.MONTSERRAT,
    }),
    __metadata("design:type", String)
], GallerySetting.prototype, "primaryFonts", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Fonts,
        default: Fonts.MONTSERRAT,
    }),
    __metadata("design:type", String)
], GallerySetting.prototype, "secondaryFonts", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PhotoLayout,
        default: PhotoLayout.GRID_LAYOUT,
    }),
    __metadata("design:type", String)
], GallerySetting.prototype, "photoLayout", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: GalleryHomePageLayout,
        default: GalleryHomePageLayout.SPLIT_SCREEN,
    }),
    __metadata("design:type", String)
], GallerySetting.prototype, "galeryHomePageLayout", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: MenuIcon,
        default: MenuIcon.FILLED,
    }),
    __metadata("design:type", String)
], GallerySetting.prototype, "menuIcon", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ImageGap,
        default: ImageGap.MEDIUM,
    }),
    __metadata("design:type", String)
], GallerySetting.prototype, "imageGap", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ColorSchema,
        default: ColorSchema.LIGHT,
    }),
    __metadata("design:type", String)
], GallerySetting.prototype, "colorSchema", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: true,
    }),
    __metadata("design:type", String)
], GallerySetting.prototype, "projectCover", void 0);
__decorate([
    (0, typeorm_2.OneToOne)(() => project_entity_1.Project, { onDelete: 'SET NULL' }),
    (0, typeorm_2.JoinColumn)({ name: 'projectId' }),
    __metadata("design:type", project_entity_1.Project)
], GallerySetting.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], GallerySetting.prototype, "projectId", void 0);
GallerySetting = __decorate([
    (0, typeorm_1.Entity)()
], GallerySetting);
exports.GallerySetting = GallerySetting;
//# sourceMappingURL=gallery-setting.entity.js.map