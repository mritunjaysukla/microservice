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
exports.Kyc_user = exports.ValidDto = exports.ValidFields = exports.KycStatus = void 0;
const user_entity_1 = require("../../user/entities/user.entity");
const typeorm_1 = require("typeorm");
var KycStatus;
(function (KycStatus) {
    KycStatus["PENDING"] = "pending";
    KycStatus["APPROVED"] = "approved";
    KycStatus["REJECTED"] = "rejected";
    KycStatus["SUBMITTED"] = "submitted";
})(KycStatus = exports.KycStatus || (exports.KycStatus = {}));
var ValidFields;
(function (ValidFields) {
    ValidFields["BasicInformation"] = "basicInformation";
    ValidFields["BusinessInformation"] = "businessInformation";
    ValidFields["IdentityVerification"] = "identityVerification";
    ValidFields["TermsAndSubmission"] = "termsAndSubmission";
})(ValidFields = exports.ValidFields || (exports.ValidFields = {}));
var ValidDto;
(function (ValidDto) {
    ValidDto["BasicInformation"] = "BasicInformation";
    ValidDto["BusinessInformation"] = "businessInformation";
    ValidDto["IdentityVerification"] = "IdentityVerification";
    ValidDto["TermsAndSubmission"] = "TermsAndSubmission";
})(ValidDto = exports.ValidDto || (exports.ValidDto = {}));
let Kyc_user = class Kyc_user {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Kyc_user.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], Kyc_user.prototype, "basicInformation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], Kyc_user.prototype, "identityVerification", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, default: {} }),
    __metadata("design:type", Object)
], Kyc_user.prototype, "businessInformation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: {} }),
    __metadata("design:type", Object)
], Kyc_user.prototype, "termsAndSubmission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: KycStatus, default: KycStatus.PENDING }),
    __metadata("design:type", String)
], Kyc_user.prototype, "kycStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, default: 'none' }),
    __metadata("design:type", String)
], Kyc_user.prototype, "adminRemarks", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Kyc_user.prototype, "user", void 0);
Kyc_user = __decorate([
    (0, typeorm_1.Entity)('kyc-user')
], Kyc_user);
exports.Kyc_user = Kyc_user;
//# sourceMappingURL=kyc-user.entity.js.map