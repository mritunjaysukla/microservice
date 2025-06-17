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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("../user/user.service");
const login_dto_1 = require("../../dto/login.dto");
const user_entity_1 = require("../../entities/user.entity");
const jwt_1 = require("@nestjs/jwt");
const shared_user_service_1 = require("src/shared-user/shared-user.service");
const otp_service_1 = require("src/otp/otp.service");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_session_entity_1 = require("src/user/entities/user-session.entity");
const useragent = require("useragent");
const geoip = require("geoip-lite");
const axios_1 = require("axios");
let AuthService = class AuthService {
    constructor(userService, jwtService, sharedUserService, otpService, userRepository, userSessionRepo) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.sharedUserService = sharedUserService;
        this.otpService = otpService;
        this.userRepository = userRepository;
        this.userSessionRepo = userSessionRepo;
    }
    async register(userDto) {
        const { projectId, photographerId, clientId, email, username } = userDto;
        try {
            const [userByUsername, userByEmail] = await Promise.all([
                this.userService.isUserExists(username),
                this.userService.isUserExists(email),
            ]);
            if (userByUsername) {
                throw new common_1.HttpException('User with username already exists', common_1.HttpStatus.BAD_REQUEST);
            }
            if (userByEmail) {
                throw new common_1.HttpException('User with email already exists', common_1.HttpStatus.BAD_REQUEST);
            }
            const user = await this.userService.createUser(userDto);
            await Promise.all([
                projectId && photographerId
                    ? this.sharedUserService.createSharedUser({
                        userId: user.id,
                        projectId,
                        photographerId,
                        clientId: clientId || null,
                    })
                    : Promise.resolve(),
            ]).catch((error) => {
                console.error('Error in post-registration processes:', error);
            });
            return {
                userInfo: user,
                message: `Registration successful. Please check your email for verification code.`,
            };
        }
        catch (error) {
            console.error('Registration error:', error);
            throw new common_1.HttpException(`Registration failed: ${error.message || 'Unknown error'}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async login(loginRequest, req) {
        const { usernameOrEmail, password, photographerId, clientId, projectId } = loginRequest;
        console.log(login_dto_1.LoginDto);
        if (!usernameOrEmail || !password) {
            throw new common_1.HttpException(`Username or email and password are required`, common_1.HttpStatus.BAD_REQUEST);
        }
        console.log('Password verified:');
        const user = await this.userService.isUserExists(usernameOrEmail);
        if (!user) {
            console.log('User not found');
            return this.failLogin('User not found');
        }
        console.log('Password verified:');
        const isPasswordValid = await this.userService.checkUserPassword(user, password);
        console.log('Password verified:', isPasswordValid);
        if (!isPasswordValid) {
            throw new common_1.HttpException({
                code: 'INVALID_PASSWORD',
                message: 'Password does not match',
            }, common_1.HttpStatus.UNAUTHORIZED);
        }
        console.log('User verified:', user.isVerified);
        if (!user.isVerified) {
            throw new common_1.HttpException({
                message: 'User is not verified',
                userId: user.id,
                email: user.email,
            }, common_1.HttpStatus.FORBIDDEN);
        }
        if (projectId && photographerId) {
            try {
                await this.sharedUserService.createSharedUser({
                    userId: user.id,
                    projectId,
                    photographerId,
                    clientId: clientId || null,
                });
            }
            catch (error) {
                console.error('Error creating shared user:', error);
                return this.failLogin('Failed to associate project/photographer with user');
            }
        }
        const token = this.userService.getUserToken(user);
        user.token = token;
        await this.userService.saveUser(user);
        const userSession = await this.trackUserSession(user, req);
        console.log(userSession);
        return {
            token,
            userSession,
        };
    }
    async trackUserSession(user, req) {
        let deviceType = 'Unknown';
        const userSession = new user_session_entity_1.UserSession();
        userSession.user = user;
        let ip = this.getClientIp(req);
        if (!ip) {
            ip = '127.0.0.1';
        }
        const { data } = await axios_1.default.get(`https://ipapi.co/${ip}/json/`);
        const { ip: responseIp, city, region, country_name, postal, latitude, longitude, org, } = data;
        console.log('IP Geolocation Info:', {
            ip: responseIp,
            city,
            region,
            country: country_name,
            postal,
            latitude,
            longitude,
            organization: org,
        });
        userSession.ipAddress = ip || '';
        userSession.userAgent = req.headers['user-agent'] || '';
        const agent = useragent.parse(req.headers['user-agent']);
        userSession.browser = agent.toAgent() || '';
        userSession.os = agent.os.toString() || '';
        const modelCode = this.getModelCodeFromUserAgent(req.headers['user-agent']);
        userSession.deviceName = modelCode || 'Unknown Model Code';
        userSession.loginAt = new Date();
        const lowerUA = agent.toString().toLowerCase();
        if (/mobile|iphone|android/.test(lowerUA)) {
            deviceType = 'Mobile';
        }
        else if (/ipad|tablet/.test(lowerUA)) {
            deviceType = 'Tablet';
        }
        else if (/windows|macintosh|linux/.test(lowerUA)) {
            deviceType = 'Desktop';
        }
        userSession.deviceType = deviceType;
        const isPrivateIp = ip.startsWith('127.') ||
            ip.startsWith('10.') ||
            ip.startsWith('192.168.') ||
            ip.startsWith('172.');
        const geoIp = geoip.lookup(isPrivateIp ? '8.8.8.8' : ip);
        if (geoIp) {
            console.log(geoIp);
            const { city, region, country } = geoIp;
            userSession.location = `${city || 'Unknown City'}, ${region || 'Unknown Region'}, ${country || 'Unknown Country'}`;
        }
        else {
            console.log('geo not found');
            userSession.location = 'Unknown Location';
        }
        console.log(userSession);
        const userSe = await this.userSessionRepo.save(userSession);
        return userSe.id;
    }
    getModelCodeFromUserAgent(userAgent) {
        if (!userAgent)
            return null;
        const lowerUA = userAgent.toLowerCase();
        const modelRegexMap = [
            { device: 'Realme', regex: /rmx(\d+)/ },
            { device: 'Redmi', regex: /m(\d{4}[a-zA-Z]*\d*)/ },
            { device: 'Samsung', regex: /sm-(\w+)/ },
            { device: 'iPhone', regex: /iphone os (\d+_\d+)/ },
            { device: 'Pixel', regex: /pixel (\d+)/ },
        ];
        for (const { regex } of modelRegexMap) {
            const match = lowerUA.match(regex);
            if (match && match[1]) {
                return match[1].toUpperCase();
            }
        }
        return null;
    }
    failLogin(message = 'Login failed') {
        throw new common_1.HttpException(message, common_1.HttpStatus.BAD_REQUEST);
    }
    generateToken(user) {
        return this.jwtService.sign({
            id: user.id,
            email: user.email,
            role: user.role,
        });
    }
    async generate2FASecret(userId) {
        console.log(userId);
        const user = await this.userRepository.findOne({
            where: {
                id: userId,
            },
        });
        if (!user) {
            throw new common_1.HttpException(`User not found for userId ${userId}`, common_1.HttpStatus.NOT_FOUND);
        }
        const secret = speakeasy.generateSecret({
            name: `Fotosfolio (${user.email})`,
        });
        const otpauthUrl = secret.otpauth_url;
        if (!otpauthUrl) {
            throw new Error('OTP Auth URL is undefined');
        }
        user.secret = secret.base32;
        user.opathUrl = otpauthUrl;
        await this.userRepository.save(user);
        const qrCode = await this.generateQRCode(userId);
        return { secret: secret.base32, qrCode };
    }
    async generateQRCode(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            select: ['opathUrl'],
        });
        if (!user) {
            throw new common_1.HttpException(`User not found for userId ${userId}`, common_1.HttpStatus.NOT_FOUND);
        }
        const url = user?.opathUrl;
        if (!url) {
            throw new common_1.HttpException(`No otpAuthUrl found for user with id ${userId}`, common_1.HttpStatus.NOT_FOUND);
        }
        return new Promise((resolve, reject) => {
            qrcode.toDataURL(url, (err, url) => {
                if (err) {
                    reject(err);
                }
                resolve(url);
            });
        });
    }
    async verify2FACode(userId, token) {
        const user = await this.userRepository.findOne({
            where: {
                id: userId,
            },
            select: ['username', 'secret', 'is2FaActive'],
        });
        if (!user) {
            throw new common_1.HttpException(`User not found for userId ${userId}`, common_1.HttpStatus.NOT_FOUND);
        }
        if (!user.secret) {
            throw new common_1.HttpException(`User's secret not found for userId ${userId}`, common_1.HttpStatus.NOT_FOUND);
        }
        const isVerified = speakeasy.totp.verify({
            secret: user.secret,
            encoding: 'base32',
            token,
            window: 0,
        });
        if (isVerified) {
            await this.userRepository.update(userId, { is2FaActive: true });
        }
        return isVerified;
    }
    getClientIp(req) {
        console.log(req.headers);
        const cf = req.headers['cf-connecting-ip'];
        return cf;
    }
    async getAllUserSession(userId, page = 1, pageSize = 10) {
        try {
            const userSession = await this.userSessionRepo.find({
                where: { user: { id: userId } },
                order: { loginAt: 'DESC' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            });
            console.log(userSession.length);
            return userSession;
        }
        catch (error) {
            console.error('Error fetching user sessions:', error);
            throw new Error('Failed to fetch user sessions');
        }
    }
    async disableSecurityOption(userId, option) {
        const updateFields = {};
        const fieldMap = {
            '2fa': 'is2FaActive',
            passkey: 'isPassKeyActive',
            securityQuestion: 'isSecurityQuestionEnabled',
        };
        const field = fieldMap[option];
        if (!field)
            throw new Error('Invalid option');
        updateFields[field] = false;
        await this.userRepository.update(userId, updateFields);
        return { message: `${field} has been disabled.` };
    }
    async enableSecurityOption(userId, option) {
        const updateFields = {};
        const fieldMap = {
            '2fa': 'is2FaActive',
            passkey: 'isPassKeyActive',
            securityQuestion: 'isSecurityQuestionEnabled',
        };
        const field = fieldMap[option];
        if (!field)
            throw new Error('Invalid option');
        updateFields[field] = true;
        await this.userRepository.update(userId, updateFields);
        return { message: `${field} has been disabled.` };
    }
    async updateLocation(id, location, deviceName) {
        const session = await this.userSessionRepo.findOne({ where: { id: id } });
        if (!session) {
            throw new common_1.NotFoundException(`Session not found for user ${id}`);
        }
        session.location = location;
        session.deviceName = deviceName;
        await this.userSessionRepo.save(session);
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(5, (0, typeorm_1.InjectRepository)(user_session_entity_1.UserSession)),
    __metadata("design:paramtypes", [user_service_1.UserService,
        jwt_1.JwtService, typeof (_a = typeof shared_user_service_1.SharedUserService !== "undefined" && shared_user_service_1.SharedUserService) === "function" ? _a : Object, typeof (_b = typeof otp_service_1.OtpService !== "undefined" && otp_service_1.OtpService) === "function" ? _b : Object, typeorm_2.Repository,
        typeorm_2.Repository])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map