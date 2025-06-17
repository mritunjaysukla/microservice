"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycVerificationModule = void 0;
const common_1 = require("@nestjs/common");
const kyc_verification_service_1 = require("./kyc-verification.service");
const kyc_verification_controller_1 = require("./kyc-verification.controller");
const kyc_user_entity_1 = require("./entity/kyc-user.entity");
const typeorm_1 = require("@nestjs/typeorm");
const upload_module_1 = require("src/upload/upload.module");
const user_entity_1 = require("src/user/entities/user.entity");
let KycVerificationModule = class KycVerificationModule {
};
KycVerificationModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([kyc_user_entity_1.Kyc_user, user_entity_1.User]), upload_module_1.UploadModule],
        providers: [kyc_verification_service_1.KycVerificationService],
        controllers: [kyc_verification_controller_1.KycVerificationController],
    })
], KycVerificationModule);
exports.KycVerificationModule = KycVerificationModule;
//# sourceMappingURL=kyc-verification.module.js.map