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
exports.SiteTestimonial = void 0;
const typeorm_1 = require("typeorm");
const site_setting_entity_1 = require("../../site-setting/entity/site-setting.entity");
let SiteTestimonial = class SiteTestimonial {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SiteTestimonial.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], SiteTestimonial.prototype, "clientName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], SiteTestimonial.prototype, "clientImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], SiteTestimonial.prototype, "projectName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], SiteTestimonial.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SiteTestimonial.prototype, "isSelected", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => site_setting_entity_1.SiteSetting, (siteSetting) => siteSetting.testimonials, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", site_setting_entity_1.SiteSetting)
], SiteTestimonial.prototype, "siteSetting", void 0);
SiteTestimonial = __decorate([
    (0, typeorm_1.Entity)()
], SiteTestimonial);
exports.SiteTestimonial = SiteTestimonial;
//# sourceMappingURL=site-testimonial.entity.js.map