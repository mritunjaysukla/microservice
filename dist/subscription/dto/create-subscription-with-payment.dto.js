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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSubscriptionWithPaymentDto = void 0;
const class_validator_1 = require("class-validator");
const payment_entity_1 = require("src/payment/entity/payment.entity");
class CreateSubscriptionWithPaymentDto {
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateSubscriptionWithPaymentDto.prototype, "planId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSubscriptionWithPaymentDto.prototype, "planDurationInMonth", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSubscriptionWithPaymentDto.prototype, "transactionId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSubscriptionWithPaymentDto.prototype, "verificationId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSubscriptionWithPaymentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreateSubscriptionWithPaymentDto.prototype, "paymentDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(payment_entity_1.PaymentMethod),
    __metadata("design:type", typeof (_a = typeof payment_entity_1.PaymentMethod !== "undefined" && payment_entity_1.PaymentMethod) === "function" ? _a : Object)
], CreateSubscriptionWithPaymentDto.prototype, "paymentMethod", void 0);
exports.CreateSubscriptionWithPaymentDto = CreateSubscriptionWithPaymentDto;
//# sourceMappingURL=create-subscription-with-payment.dto.js.map