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
exports.Plan = exports.Package = exports.PlanName = void 0;
const subscription_entity_1 = require("../../subscription/entity/subscription.entity");
const discount_entity_1 = require("../../discount/entity/discount.entity");
const typeorm_1 = require("typeorm");
var PlanName;
(function (PlanName) {
    PlanName["MONTHLY"] = "monthly";
    PlanName["THREE_MONTHS"] = "3months";
    PlanName["SIX_MONTHS"] = "6months";
    PlanName["TWELVE_MONTHS"] = "12months";
})(PlanName = exports.PlanName || (exports.PlanName = {}));
var Package;
(function (Package) {
    Package["STARTER"] = "starter";
    Package["CREATOR"] = "creator";
    Package["PRO"] = "pro";
    Package["ELITE"] = "elite";
})(Package = exports.Package || (exports.Package = {}));
let Plan = class Plan {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Plan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Package,
    }),
    __metadata("design:type", String)
], Plan.prototype, "package", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PlanName,
    }),
    __metadata("design:type", String)
], Plan.prototype, "planName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Plan.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Plan.prototype, "pricePerMonth", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Plan.prototype, "pricePerThreeMonth", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Plan.prototype, "pricePerSixMonth", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Plan.prototype, "pricePerYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Plan.prototype, "storage", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], Plan.prototype, "discountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Plan.prototype, "isFree", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Plan.prototype, "feature", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Plan.prototype, "isPopular", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subscription_entity_1.Subscription, (subscription) => subscription.plan),
    __metadata("design:type", Array)
], Plan.prototype, "subscriptions", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => discount_entity_1.Discount, (discount) => discount.plans, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'discountId' }),
    __metadata("design:type", discount_entity_1.Discount)
], Plan.prototype, "discount", void 0);
Plan = __decorate([
    (0, typeorm_1.Entity)()
], Plan);
exports.Plan = Plan;
//# sourceMappingURL=plan.entity.js.map