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
exports.PortfolioView = void 0;
const typeorm_1 = require("typeorm");
const site_setting_entity_1 = require("./site-setting.entity");
let PortfolioView = class PortfolioView {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PortfolioView.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => site_setting_entity_1.SiteSetting, siteSetting => siteSetting.portfolioViews),
    __metadata("design:type", site_setting_entity_1.SiteSetting)
], PortfolioView.prototype, "siteSetting", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PortfolioView.prototype, "siteSettingId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PortfolioView.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PortfolioView.prototype, "ipAddress", void 0);
PortfolioView = __decorate([
    (0, typeorm_1.Entity)()
], PortfolioView);
exports.PortfolioView = PortfolioView;
//# sourceMappingURL=portfolio-view.entity.js.map