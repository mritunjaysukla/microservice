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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasskeyAuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const server_1 = require("@simplewebauthn/server");
const user_entity_1 = require("src/user/entities/user.entity");
const typeorm_2 = require("typeorm");
const auth_service_1 = require("src/user/services/auth/auth.service");
const user_service_1 = require("src/user/services/user/user.service");
let PasskeyAuthService = class PasskeyAuthService {
    constructor(userRepository, authService, userService) {
        this.userRepository = userRepository;
        this.authService = authService;
        this.userService = userService;
        this.rpName = 'Fotosfolio';
        this.rpID = 'dev.fotosfolio.com';
        this.origin = 'https://dev.fotosfolio.com';
    }
    safeDecodeClientDataJSON(clientDataJSONBase64) {
        try {
            const base64 = clientDataJSONBase64.replace(/-/g, '+').replace(/_/g, '/');
            const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
            const decoded = Buffer.from(padded, 'base64').toString('utf-8');
            console.log('Decoded clientDataJSON:', decoded);
            return JSON.parse(decoded);
        }
        catch (err) {
            console.error('Failed to decode or parse clientDataJSON:', err.message);
            return null;
        }
    }
    async generateRegistrationOptions(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['id', 'email'],
        });
        if (!user) {
            throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
        }
        if (!user.email) {
            throw new common_1.HttpException("User's email not found", common_1.HttpStatus.NOT_FOUND);
        }
        return (0, server_1.generateRegistrationOptions)({
            rpName: this.rpName,
            rpID: this.rpID,
            userID: new TextEncoder().encode(user.id.toString()),
            userName: user.email,
            attestationType: 'direct',
            authenticatorSelection: {
                residentKey: 'required',
                userVerification: 'required',
            },
            supportedAlgorithmIDs: [-7, -257],
        });
    }
    async verifyRegistrationResponse(response, expectedChallenge) {
        console.log('Received response:', response);
        console.log('Expected challenge:', expectedChallenge);
        try {
            const verification = await (0, server_1.verifyRegistrationResponse)({
                response,
                expectedChallenge,
                expectedOrigin: this.origin,
                expectedRPID: this.rpID,
            });
            console.log('Verification result:', verification);
            console.error('Verification object:', verification);
            console.log(verification);
            if (verification.verified) {
                const { credential } = verification.registrationInfo;
                if (!credential || !credential.id) {
                    throw new Error('Missing credential ID');
                }
                const credentialPublicKeyBase64 = Buffer.from(credential.publicKey).toString('base64');
                const { id: credentialID, counter } = credential;
                const user = await this.userRepository.findOne({
                    where: { id: response.user.id },
                });
                console.log('User found:', user);
                if (!user) {
                    throw new Error('User not found');
                }
                console.log(user.credentialPublicKey);
                user.credentialPublicKey = credentialPublicKeyBase64;
                user.credentialID = credentialID;
                user.counter = counter;
                await this.userRepository.save(user);
                await this.authService.enableSecurityOption(user.id, 'passkey');
                return { credentialID, credentialPublicKeyBase64, counter };
            }
            throw new Error('Registration verification failed');
        }
        catch (error) {
            console.error('Error during verification:', error);
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async generateAuthenticationOptions() {
        return (0, server_1.generateAuthenticationOptions)({
            rpID: this.rpID,
            userVerification: 'preferred',
        });
    }
    async verifyAuthenticationResponse(response, expectedChallenge) {
        try {
            const credentialID = response.rawId || response.id;
            const user = await this.userRepository
                .createQueryBuilder('user')
                .addSelect([
                'user.password',
                'user.token',
                'user.googleId',
                'user.facebookId',
                'user.credentialID',
            ])
                .where('user.credentialID = :credentialID', { credentialID })
                .getOne();
            if (!user) {
                throw new common_1.HttpException('User not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (!user.credentialID || !user.credentialPublicKey) {
                throw new common_1.HttpException('Missing credential info for user', common_1.HttpStatus.BAD_REQUEST);
            }
            console.log('User found:', user);
            const verification = await (0, server_1.verifyAuthenticationResponse)({
                response,
                expectedChallenge,
                expectedOrigin: this.origin,
                expectedRPID: this.rpID,
                credential: {
                    id: user.credentialID,
                    publicKey: new Uint8Array(Buffer.from(user.credentialPublicKey, 'base64')),
                    counter: user.counter || 0,
                },
            });
            console.log('Verification result:', verification);
            if (!verification.verified) {
                throw new common_1.HttpException('Authentication verification failed', common_1.HttpStatus.UNAUTHORIZED);
            }
            const { newCounter } = verification.authenticationInfo || {};
            if (newCounter === undefined) {
                throw new common_1.HttpException('No new counter returned from authenticationInfo', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            user.counter = newCounter;
            await this.userRepository.save(user);
            console.log(user);
            const token = await this.userService.getUserToken(user);
            console.log('User saved with updated counter:', user);
            return token;
        }
        catch (error) {
            console.error('Error during authentication verification:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Internal server error during authentication verification', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
PasskeyAuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object, typeof (_b = typeof user_service_1.UserService !== "undefined" && user_service_1.UserService) === "function" ? _b : Object])
], PasskeyAuthService);
exports.PasskeyAuthService = PasskeyAuthService;
//# sourceMappingURL=passkey-auth.service.js.map