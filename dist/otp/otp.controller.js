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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpController = void 0;
const common_1 = require("@nestjs/common");
const otp_service_1 = require("./otp.service");
const swagger_1 = require("@nestjs/swagger");
const verity_otp_dto_1 = require("./dto/verity-otp.dto");
const generate_otp_dto_1 = require("./dto/generate-otp.dto");
const resend_otp_dto_1 = require("./dto/resend-otp.dto");
const auth_decorator_1 = require("src/common/decorator/auth.decorator");
const user_entity_1 = require("src/user/entities/user.entity");
const auth_service_1 = require("src/user/services/auth/auth.service");
let OtpController = class OtpController {
    constructor(otpService, authService) {
        this.otpService = otpService;
        this.authService = authService;
    }
    findAll() {
        return this.otpService.findAll();
    }
    findOne(id) {
        return this.otpService.findOne(id);
    }
    remove(id) {
        return this.otpService.delete(id);
    }
    async verifyOtp(verifyOtpDto, response) {
        const result = await this.otpService.verifyOtp(verifyOtpDto);
        console.log(result);
        return response.status(result.status).json(result);
    }
    async generateOtp(generateOtpDto) {
        const { email } = generateOtpDto;
        const otp = await this.otpService.generateOtp(email);
        return { message: 'OTP sent successfully' };
    }
    async resendOtp(resendOtpDto) {
        return this.otpService.resendOtp(resendOtpDto);
    }
    async verify2FAOtp(verifyOtpDto, response) { }
};
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(user_entity_1.Role.ADMIN),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OtpController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(user_entity_1.Role.ADMIN),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OtpController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(user_entity_1.Role.ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OtpController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verity_otp_dto_1.VerifyOtpDto, Object]),
    __metadata("design:returntype", Promise)
], OtpController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('generate-otp'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_otp_dto_1.GenerateOtpDto]),
    __metadata("design:returntype", Promise)
], OtpController.prototype, "generateOtp", null);
__decorate([
    (0, common_1.Post)('resend'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resend_otp_dto_1.ResendOtpDto]),
    __metadata("design:returntype", Promise)
], OtpController.prototype, "resendOtp", null);
__decorate([
    (0, common_1.Post)('2FA/verify-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verity_otp_dto_1.VerifyOtpDto, Object]),
    __metadata("design:returntype", Promise)
], OtpController.prototype, "verify2FAOtp", null);
OtpController = __decorate([
    (0, swagger_1.ApiTags)('OTP'),
    (0, common_1.Controller)('otp'),
    __metadata("design:paramtypes", [otp_service_1.OtpService, typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], OtpController);
exports.OtpController = OtpController;
//# sourceMappingURL=otp.controller.js.map