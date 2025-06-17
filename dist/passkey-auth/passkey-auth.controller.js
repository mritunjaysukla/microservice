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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasskeyAuthController = void 0;
const common_1 = require("@nestjs/common");
const passkey_auth_service_1 = require("./passkey-auth.service");
const common_2 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
let PasskeyAuthController = class PasskeyAuthController {
    constructor(passkeyAuthService) {
        this.passkeyAuthService = passkeyAuthService;
    }
    async generateRegistrationOptions(userId) {
        try {
            const registrationOptions = await this.passkeyAuthService.generateRegistrationOptions(userId);
            return { registrationOptions };
        }
        catch (error) {
            throw new common_2.HttpException(error.message, common_2.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyRegistrationResponse(response, expectedChallenge) {
        console.log(response);
        try {
            const verificationResult = await this.passkeyAuthService.verifyRegistrationResponse(response, expectedChallenge);
            return verificationResult;
        }
        catch (error) {
            throw new common_2.HttpException(error.message, common_2.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateAuthenticationOptions() {
        try {
            const authOptions = await this.passkeyAuthService.generateAuthenticationOptions();
            return { authOptions };
        }
        catch (error) {
            throw new common_2.HttpException(error.message, common_2.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async verifyAuthenticationResponse(response, expectedChallenge) {
        try {
            const newCounter = await this.passkeyAuthService.verifyAuthenticationResponse(response, expectedChallenge);
            return { newCounter };
        }
        catch (error) {
            throw new common_2.HttpException(error.message, common_2.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
__decorate([
    (0, common_1.Post)('register-options'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate passkey registration options' }),
    (0, swagger_1.ApiBody)({ description: 'User ID for registration', type: String }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully generated registration options',
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal Server Error' }),
    __param(0, (0, common_1.Body)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PasskeyAuthController.prototype, "generateRegistrationOptions", null);
__decorate([
    (0, common_1.Post)('verify-registration'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify passkey registration response' }),
    (0, swagger_1.ApiBody)({ description: 'Passkey registration response', type: Object }),
    (0, swagger_1.ApiQuery)({ name: 'expectedChallenge', required: true, type: String }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Registration verification successful',
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal Server Error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('expectedChallenge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PasskeyAuthController.prototype, "verifyRegistrationResponse", null);
__decorate([
    (0, common_1.Post)('auth-options'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate passkey authentication options' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Successfully generated authentication options',
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal Server Error' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PasskeyAuthController.prototype, "generateAuthenticationOptions", null);
__decorate([
    (0, common_1.Post)('verify-authentication'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify passkey authentication response' }),
    (0, swagger_1.ApiBody)({ description: 'Passkey authentication response', type: Object }),
    (0, swagger_1.ApiQuery)({ name: 'expectedChallenge', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'userId', required: true, type: String }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Authentication verification successful',
    }),
    (0, swagger_1.ApiResponse)({ status: 500, description: 'Internal Server Error' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Query)('expectedChallenge')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PasskeyAuthController.prototype, "verifyAuthenticationResponse", null);
PasskeyAuthController = __decorate([
    (0, swagger_1.ApiTags)('passkey-auth'),
    (0, common_1.Controller)('passkey-auth'),
    __metadata("design:paramtypes", [passkey_auth_service_1.PasskeyAuthService])
], PasskeyAuthController);
exports.PasskeyAuthController = PasskeyAuthController;
//# sourceMappingURL=passkey-auth.controller.js.map