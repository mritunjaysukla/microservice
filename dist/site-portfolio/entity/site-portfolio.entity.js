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
exports.SitePortfolio = void 0;
const typeorm_1 = require("typeorm");
const site_setting_entity_1 = require("../../site-setting/entity/site-setting.entity");
const site_portfolio_images_entity_1 = require("../../site-portfolio-images/entity/site-portfolio-images.entity");
let SitePortfolio = class SitePortfolio {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SitePortfolio.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], SitePortfolio.prototype, "projectName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], SitePortfolio.prototype, "shootName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SitePortfolio.prototype, "filesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], SitePortfolio.prototype, "thumbnail", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => site_setting_entity_1.SiteSetting, (siteSetting) => siteSetting.portfolios, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", site_setting_entity_1.SiteSetting)
], SitePortfolio.prototype, "siteSetting", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => site_portfolio_images_entity_1.SitePortfolioImages, (image) => image.portfolio, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], SitePortfolio.prototype, "images", void 0);
SitePortfolio = __decorate([
    (0, typeorm_1.Entity)()
], SitePortfolio);
exports.SitePortfolio = SitePortfolio;
//# sourceMappingURL=site-portfolio.entity.js.map