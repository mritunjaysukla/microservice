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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const create_user_dto_1 = require("./dto/create-user.dto");
const auth_service_1 = require("./services/auth/auth.service");
const login_dto_1 = require("./dto/login.dto");
const user_service_1 = require("./services/user/user.service");
const swagger_1 = require("@nestjs/swagger");
const auth_decorator_1 = require("src/common/decorator/auth.decorator");
const update_user_dto_1 = require("./dto/update-user.dto");
const user_entity_1 = require("./entities/user.entity");
const fogot_password_dto_1 = require("./dto/fogot-password.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const change_password_dto_1 = require("./dto/change-password.dto");
const passport_1 = require("@nestjs/passport");
const create_admin_dto_1 = require("./dto/create-admin.dto");
const token_password_change_dto_1 = require("./dto/token-password-change.dto");
const otp_service_1 = require("src/otp/otp.service");
const contact_dto_1 = require("./dto/contact.dto");
const sendEmail_1 = require("src/utils/sendEmail");
let UserController = class UserController {
    constructor(authService, userService, otpService, mailerService) {
        this.authService = authService;
        this.userService = userService;
        this.otpService = otpService;
        this.mailerService = mailerService;
    }
    async getPortfolioViewStats(period, req) {
        return this.userService.getPortfolioViewStats(req.user.id, period);
    }
    async getUserSession(req) {
        try {
            return await this.authService.getAllUserSession(req.user?.id);
        }
        catch (error) {
            console.error('Error fetching user sessions:', error);
            throw new Error('Failed to fetch user sessions');
        }
    }
    async getResetToken(email) {
        return await this.userService.getResetToken(email);
    }
    async generate(userId) {
        const { secret, qrCode } = await this.authService.generate2FASecret(userId);
        return { secret, qrCode };
    }
    async getQr(userId) {
        return await this.authService.generateQRCode(userId);
    }
    async verify(secret, token, res) {
        const isValid = await this.authService.verify2FACode(secret, token);
        if (isValid) {
            return res.status(200).json({
                isVerified: true,
                message: 'OTP verified successfully',
            });
        }
        else {
            return res.status(400).json({
                isVerified: false,
                message: 'OTP verification failed',
            });
        }
    }
    async getMainClients(username, email, phoneNumber, status, page = 1, limit = 10) {
        return this.userService.getMainClients({
            username,
            email,
            phoneNumber,
            status,
            page,
            limit,
        });
    }
    async getAllClientUsers(page = '1', limit = '10') {
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        return await this.userService.getAllClientUser(pageNumber, limitNumber);
    }
    async getRoleCounts() {
        return this.userService.getCountsByRole();
    }
    async register(user) {
        try {
            const { userInfo, message } = await this.authService.register(user);
            if (userInfo && userInfo.email) {
                try {
                    await this.otpService.generateOtp(userInfo.email);
                }
                catch (error) {
                    console.error('Error generating OTP:', error);
                }
            }
            return {
                user: {
                    id: userInfo.id,
                    name: userInfo.name,
                    dateOfBirth: userInfo.dateOfBirth,
                    email: userInfo.email,
                    username: userInfo.username,
                    role: userInfo.role,
                    status: userInfo.status,
                    isVerfied: userInfo.isVerified,
                },
                details: message,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            if (error.code === '23505') {
                throw new common_1.ConflictException('Username or email already exists');
            }
            if (error.message.includes('validation')) {
                throw new common_1.BadRequestException(error.message);
            }
            throw new common_1.InternalServerErrorException('An error occurred during registration. Please try again later.');
        }
    }
    async loginNonAdmin(login, req) {
        try {
            const user = await this.userService.validateUser(login.usernameOrEmail, login.password);
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid username/email or password');
            }
            if (user.role === 'admin') {
                throw new common_1.UnauthorizedException('This login endpoint is not for admin users');
            }
            const logIn = await this.authService.login(login, req);
            if (!logIn) {
                throw new common_1.UnauthorizedException('Authentication failed');
            }
            const { token, userSession } = logIn;
            return {
                message: 'Login successful',
                token,
                userSession,
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('An error occurred during login. Please try again later.');
        }
    }
    async loginAdmin(login, req) {
        const user = await this.userService.validateUser(login.usernameOrEmail, login.password);
        if (!user || user.role !== 'admin') {
            throw new common_1.UnauthorizedException('Access denied');
        }
        const logIn = await this.authService.login(login, req);
        if (!logIn) {
            throw new Error('Login failed or returned an invalid result.');
        }
        const { token, userSession } = logIn;
        console.log(logIn);
        return {
            message: 'Login successful',
            token,
            userSession,
        };
    }
    async getAllAdmins(username, email, phoneNumber, status, permission, page = 1, limit = 10) {
        return this.userService.getAllAdmins({
            username,
            email,
            phoneNumber,
            status,
            permission,
            page,
            limit,
        });
    }
    async getUsers(username, email, phoneNumber, role, status, page = 1, limit = 10) {
        const users = await this.userService.getAllUsers({
            username,
            email,
            phoneNumber,
            role,
            status,
            page,
            limit,
        });
        return users;
    }
    async getMe(req) {
        const userId = req.user.id;
        return this.userService.getUserById(userId);
    }
    async forgotPassword(forgotPasswordDto) {
        const { email } = forgotPasswordDto;
        return this.userService.sendForgotPasswordLink(email);
    }
    async resetPassword(resetPasswordDto) {
        const { resetToken, newPassword } = resetPasswordDto;
        return this.userService.resetPassword(resetToken, newPassword);
    }
    async changePassword(changePasswordDto, req) {
        const userId = req.user.id;
        console.log('userID:', userId);
        return this.userService.changePassword(userId, changePasswordDto);
    }
    async changePasswordWithToken(tokenPasswordChangeDto) {
        return this.userService.changePasswordWithToken(tokenPasswordChangeDto);
    }
    async googleAuth(photographerId, projectId, res) {
        const stateObj = { photographerId, projectId };
        const state = Buffer.from(JSON.stringify(stateObj)).toString('base64');
        const params = new URLSearchParams({
            client_id: process.env.GOOGLE_APP_ID || '',
            redirect_uri: `${process.env.BASE_URL}/user/google/redirect`,
            response_type: 'code',
            scope: 'email profile',
            access_type: 'offline',
            state,
        });
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
        return res.redirect(googleAuthUrl);
    }
    async googleAuthRedirect(req) {
        const token = this.authService.generateToken(req.user);
        return { message: 'Google login successful', token };
    }
    async facebookAuth() {
    }
    async facebookAuthRedirect(req) {
        const token = this.authService.generateToken(req.user);
        return { message: 'Facebook login successful', token };
    }
    async getPhotographerDetails(username, email, phoneNumber, planName, packageName, status, page = 1, limit = 10) {
        return this.userService.getAllPhotographersWithPlans({
            username,
            email,
            phoneNumber,
            planName,
            packageName,
            status,
            page,
            limit,
        });
    }
    async uploadAvatar(file, req) {
        const userId = req.user.id;
        return this.userService.uploadAvatar(userId, file);
    }
    async createAdmin(createAdminDto, file) {
        return this.userService.createAdmin(createAdminDto, file);
    }
    async checkUsername(username) {
        return this.userService.checkUsername(username);
    }
    async getCountOfClients(photographerId, period) {
        if (!['month', 'year'].includes(period)) {
            return { error: 'Invalid period. Use "month" or "year".' };
        }
        const clientCount = await this.userService.getCountOfClientById(photographerId, period);
        return {
            photographerId,
            period,
            clientCount,
        };
    }
    async updateUser(id, updateUserDto, avatar) {
        return this.userService.updateUser(id, updateUserDto, avatar);
    }
    async deleteUser(id) {
        return this.userService.deleteUser(id);
    }
    async getUser(id) {
        return this.userService.getUserById(id);
    }
    async verifiedUser(userId) {
        return await this.userService.isVerifiedUser(userId);
    }
    async disableSecurity(id, option) {
        return await this.authService.disableSecurityOption(id, option);
    }
    async updateLocation(id, location, deviceName) {
        try {
            await this.authService.updateLocation(id, location, deviceName);
            return { message: 'Location updated successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new Error('An error occurred while updating location');
        }
    }
    async deactivateUser(userId) {
        return await this.userService.inactiveUser(userId);
    }
    async sendMessage(contactDto) {
        await this.mailerService.sendEmail(contactDto);
        return { message: 'Your message has been sent successfully.' };
    }
};
__decorate([
    (0, common_1.Get)('portfolio-views/:period'),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('period')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getPortfolioViewStats", null);
__decorate([
    (0, common_1.Get)('session'),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserSession", null);
__decorate([
    (0, common_1.Get)('reset/:email'),
    __param(0, (0, common_1.Param)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getResetToken", null);
__decorate([
    (0, common_1.Get)('generate/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate 2FA Secret and QR Code' }),
    (0, swagger_1.ApiParam)({ name: 'userId', type: 'string' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Returns secret and QR code URL',
        schema: {
            type: 'object',
            properties: {
                secret: { type: 'string', example: 'JBSWY3DPEHPK3PXP' },
                qrCode: {
                    type: 'string',
                    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "generate", null);
__decorate([
    (0, common_1.Get)('qr/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate a QR code from OTP Auth URL' }),
    (0, swagger_1.ApiParam)({
        name: 'userId',
        description: 'The OTP Auth URL to generate the QR code from',
        type: String,
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'The generated QR code image',
        content: {
            'image/png': {
                schema: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getQr", null);
__decorate([
    (0, common_1.Post)('verify/:userId/:token'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify 2FA Code' }),
    (0, swagger_1.ApiParam)({ name: 'userId', type: 'string', example: 'JBSWY3DPEHPK3PXP' }),
    (0, swagger_1.ApiParam)({ name: 'token', type: 'string', example: '123456' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns if the 2FA token is valid or not',
        schema: {
            type: 'object',
            properties: {
                isValid: { type: 'boolean', example: true },
            },
        },
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('token')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "verify", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(user_entity_1.Role.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Get main clients',
        description: 'Fetch a paginated list of main clients by filters.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'username', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'email', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'phoneNumber', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: user_entity_1.Status }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10 }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of main clients',
    }),
    (0, common_1.Get)('main-clients'),
    __param(0, (0, common_1.Query)('username')),
    __param(1, (0, common_1.Query)('email')),
    __param(2, (0, common_1.Query)('phoneNumber')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMainClients", null);
__decorate([
    (0, auth_decorator_1.Auth)(user_entity_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('clients'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllClientUsers", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    (0, common_1.Get)('role-counts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getRoleCounts", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Request]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "loginNonAdmin", null);
__decorate([
    (0, common_1.Post)('login/admin'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Request]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "loginAdmin", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(user_entity_1.Role.ADMIN),
    (0, common_1.Get)('admins'),
    (0, swagger_1.ApiQuery)({ name: 'username', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'email', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'phoneNumber', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'permission', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('username')),
    __param(1, (0, common_1.Query)('email')),
    __param(2, (0, common_1.Query)('phoneNumber')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('permission')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAllAdmins", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(user_entity_1.Role.ADMIN),
    (0, common_1.Get)('/'),
    (0, swagger_1.ApiQuery)({ name: 'username', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'email', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'phoneNumber', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('username')),
    __param(1, (0, common_1.Query)('email')),
    __param(2, (0, common_1.Query)('phoneNumber')),
    __param(3, (0, common_1.Query)('role')),
    __param(4, (0, common_1.Query)('status')),
    __param(5, (0, common_1.Query)('page')),
    __param(6, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsers", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMe", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [fogot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "resetPassword", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    (0, common_1.Patch)('change-password'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_password_dto_1.ChangePasswordDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('forgot-password/token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [token_password_change_dto_1.TokenPasswordChangeDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changePasswordWithToken", null);
__decorate([
    (0, common_1.Get)('google'),
    __param(0, (0, common_1.Query)('photographerId')),
    __param(1, (0, common_1.Query)('projectId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google/redirect'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('google')),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "googleAuthRedirect", null);
__decorate([
    (0, common_1.Get)('facebook'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('facebook')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "facebookAuth", null);
__decorate([
    (0, common_1.Get)('facebook/redirect'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('facebook')),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "facebookAuthRedirect", null);
__decorate([
    (0, common_1.Get)('photographer/details'),
    (0, swagger_1.ApiQuery)({ name: 'username', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'email', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'phoneNumber', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'planName', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'packageName', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Query)('username')),
    __param(1, (0, common_1.Query)('email')),
    __param(2, (0, common_1.Query)('phoneNumber')),
    __param(3, (0, common_1.Query)('planName')),
    __param(4, (0, common_1.Query)('packageName')),
    __param(5, (0, common_1.Query)('status')),
    __param(6, (0, common_1.Query)('page')),
    __param(7, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getPhotographerDetails", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    (0, common_1.Post)('upload-avatar'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Upload user avatar',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "uploadAvatar", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(user_entity_1.Role.ADMIN),
    (0, common_1.Post)('create-admin'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Create admin with avatar upload',
        schema: {
            type: 'object',
            properties: {
                username: { type: 'string' },
                name: { type: 'string' },
                password: { type: 'string' },
                email: { type: 'string' },
                phoneNumber: { type: 'string' },
                permission: { type: 'string', enum: ['read', 'write', 'delete'] },
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_dto_1.CreateAdminDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Get)('check-username/:username'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "checkUsername", null);
__decorate([
    (0, common_1.Get)('client-count/:photographerId'),
    __param(0, (0, common_1.Param)('photographerId')),
    __param(1, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getCountOfClients", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    (0, common_1.Patch)('/:id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('avatar')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Update user with optional avatar',
        type: update_user_dto_1.UpdateUserDto,
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateUser", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(user_entity_1.Role.ADMIN),
    (0, common_1.Delete)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deleteUser", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUser", null);
__decorate([
    (0, common_1.Get)('isVerified/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "verifiedUser", null);
__decorate([
    (0, common_1.Patch)(':id/disable-security-option'),
    (0, swagger_1.ApiParam)({ name: 'id', type: String, description: 'User ID' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                option: {
                    type: 'string',
                    enum: ['2fa', 'passkey', 'securityQuestion'],
                    description: 'The security option to disable',
                },
            },
            required: ['option'],
        },
        examples: {
            disable2FA: {
                summary: 'Disable 2FA',
                value: { option: '2fa' },
            },
            disablePasskey: {
                summary: 'Disable Passkey',
                value: { option: 'passkey' },
            },
            disableSecurityQuestion: {
                summary: 'Disable Security Question',
                value: { option: 'securityQuestion' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('option')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "disableSecurity", null);
__decorate([
    (0, common_1.Patch)('userSession/:id/location'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user session location and device name' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                location: { type: 'string', example: 'Kathmandu, Nepal' },
                deviceName: { type: 'string', example: 'MacBook Pro' },
            },
            required: ['location', 'deviceName'],
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('location')),
    __param(2, (0, common_1.Body)('deviceName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Patch)('deactivateUser'),
    __param(0, (0, common_1.Query)('UserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "deactivateUser", null);
__decorate([
    (0, common_1.Post)('contactUs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_dto_1.ContactDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "sendMessage", null);
UserController = __decorate([
    (0, swagger_1.ApiTags)('User'),
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        user_service_1.UserService, typeof (_a = typeof otp_service_1.OtpService !== "undefined" && otp_service_1.OtpService) === "function" ? _a : Object, typeof (_b = typeof sendEmail_1.MailerService !== "undefined" && sendEmail_1.MailerService) === "function" ? _b : Object])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map