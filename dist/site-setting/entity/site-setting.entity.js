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
exports.SiteSetting = exports.ColorSchema = void 0;
const site_portfolio_entity_1 = require("../../site-portfolio/entity/site-portfolio.entity");
const site_testimonial_entity_1 = require("../../site-testimonial/entity/site-testimonial.entity");
const user_entity_1 = require("../../user/entities/user.entity");
const typeorm_1 = require("typeorm");
const portfolio_view_entity_1 = require("./portfolio-view.entity");
var ColorSchema;
(function (ColorSchema) {
    ColorSchema["LIGHT"] = "light";
    ColorSchema["DARK"] = "dark";
    ColorSchema["CUSTOM"] = "custom";
})(ColorSchema = exports.ColorSchema || (exports.ColorSchema = {}));
let SiteSetting = class SiteSetting {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SiteSetting.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], SiteSetting.prototype, "watermark", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SiteSetting.prototype, "portfolioCoverImg", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SiteSetting.prototype, "userAgreement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SiteSetting.prototype, "legalAgreement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SiteSetting.prototype, "publishUserAgreement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SiteSetting.prototype, "publishLegalAgreement", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'json',
        nullable: true,
    }),
    __metadata("design:type", Object)
], SiteSetting.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ColorSchema,
        nullable: true,
    }),
    __metadata("design:type", String)
], SiteSetting.prototype, "colorSchema", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], SiteSetting.prototype, "brandText", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0, nullable: true }),
    __metadata("design:type", Number)
], SiteSetting.prototype, "portfolioViewsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], SiteSetting.prototype, "brandLogo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], SiteSetting.prototype, "facebookLink", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], SiteSetting.prototype, "instagramLink", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], SiteSetting.prototype, "linkedinLink", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], SiteSetting.prototype, "youtubeLink", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SiteSetting.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], SiteSetting.prototype, "serviceStarted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], SiteSetting.prototype, "totalProject", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], SiteSetting.prototype, "happyClient", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SiteSetting.prototype, "showBrandLogo", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.siteSetting, { onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], SiteSetting.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => site_testimonial_entity_1.SiteTestimonial, (testimonial) => testimonial.siteSetting),
    __metadata("design:type", Array)
], SiteSetting.prototype, "testimonials", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => site_portfolio_entity_1.SitePortfolio, (portfolio) => portfolio.siteSetting),
    __metadata("design:type", Array)
], SiteSetting.prototype, "portfolios", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => portfolio_view_entity_1.PortfolioView, (view) => view.siteSetting),
    __metadata("design:type", Array)
], SiteSetting.prototype, "portfolioViews", void 0);
SiteSetting = __decorate([
    (0, typeorm_1.Entity)()
], SiteSetting);
exports.SiteSetting = SiteSetting;
//# sourceMappingURL=site-setting.entity.js.map