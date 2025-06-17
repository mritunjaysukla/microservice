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
exports.OtpService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const otp_entity_1 = require("../../src/otp/entity/otp.entity");
const common_2 = require("@nestjs/common");
const user_entity_1 = require("src/user/entities/user.entity");
const crypto = require("crypto");
const send_email_service_1 = require("src/send-email/send-email.service");
let OtpService = class OtpService {
    constructor(otpRepository, userRepository, mailerService) {
        this.otpRepository = otpRepository;
        this.userRepository = userRepository;
        this.mailerService = mailerService;
    }
    async findAll() {
        return this.otpRepository
            .createQueryBuilder('otp')
            .leftJoinAndSelect('otp.user', 'user')
            .select([
            'otp.id',
            'otp.code',
            'otp.expiresAt',
            'otp.createdAt',
            'user.id',
            'user.name',
            'user.username',
            'user.email',
            'user.phoneNumber',
            'user.role',
        ])
            .getMany();
    }
    async findOne(id) {
        const otp = await this.otpRepository
            .createQueryBuilder('otp')
            .leftJoinAndSelect('otp.user', 'user')
            .select([
            'otp.id',
            'otp.code',
            'otp.expiresAt',
            'otp.createdAt',
            'user.name',
            'user.username',
            'user.email',
            'user.phoneNumber',
            'user.role',
        ])
            .where('otp.id = :id', { id })
            .getOne();
        if (!otp) {
            throw new common_1.NotFoundException(`OTP with ID ${id} not found`);
        }
        return otp;
    }
    async delete(otpId) {
        const otp = await this.otpRepository.findOne({ where: { id: otpId } });
        if (!otp) {
            throw new common_1.NotFoundException(`Otp with ID ${otpId} not found`);
        }
        await this.otpRepository.delete(otpId);
        return { message: 'Otp deleted successfully' };
    }
    async verifyOtp(verifyOtpDto) {
        const { otp, email } = verifyOtpDto;
        try {
            const user = await this.userRepository.findOne({ where: { email } });
            if (!user || !user.email) {
                console.log('No user found');
                throw new common_1.NotFoundException('User not found');
            }
            const userId = user.id;
            const storedOtp = await this.otpRepository.findOne({
                where: { userId: user?.id },
                order: { createdAt: 'DESC' },
            });
            if (!storedOtp) {
                throw new common_2.BadRequestException('No OTP found for this user');
            }
            if (new Date() > storedOtp.expiresAt) {
                throw new common_2.BadRequestException('OTP has expired');
            }
            if (storedOtp.code !== otp) {
                throw new common_2.BadRequestException('Invalid OTP');
            }
            await this.userRepository.update({ id: userId }, { isVerified: true });
            await this.otpRepository.delete({ userId });
            await this.mailerService.sendOtpVerifiedEmail(user.email, user.name);
            return {
                status: 200,
                isVerified: true,
                message: 'OTP verified successfully',
            };
        }
        catch (error) {
            console.error('OTP verification failed:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('An error occurred while verifying OTP');
        }
    }
    async generateOtp(email) {
        try {
            const user = await this.userRepository.findOne({
                where: { email },
                select: ['id', 'email', 'name'],
            });
            console.log(user);
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (!user.email) {
                throw new common_2.BadRequestException('User does not have a valid email address');
            }
            const otp = crypto.randomInt(100000, 999999).toString();
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
            await this.otpRepository.upsert({
                code: otp,
                expiresAt,
                userId: user.id,
            }, ['userId']);
            console.log(user.name);
            await this.mailerService.sendOtpEmail(user.email, user.name, otp);
            return { message: 'OTP sent successfully' };
        }
        catch (error) {
            console.log(error);
            if (error instanceof common_2.BadRequestException ||
                error instanceof common_1.NotFoundException ||
                error instanceof common_1.InternalServerErrorException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException('An error occurred while generating OTP');
        }
    }
    async resendOtp(resendOtpDto) {
        const { email } = resendOtpDto;
        const user = await this.userRepository.findOne({
            where: { email },
            select: ['id', 'email', 'name'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const userId = user.id;
        const existingOtp = await this.otpRepository.findOne({ where: { userId } });
        if (!existingOtp) {
            throw new common_1.NotFoundException('No OTP record found for this user');
        }
        const newOtpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await this.otpRepository.delete({ userId });
        const newOtp = this.otpRepository.create({
            userId,
            code: newOtpCode,
            expiresAt,
        });
        await this.otpRepository.save(newOtp);
        const recipient = user.email;
        if (recipient) {
            try {
                await this.mailerService.sendOtpEmail(recipient, user.name, newOtpCode);
            }
            catch (error) {
                console.error('Error sending OTP email:', error);
                throw new Error('Failed to send OTP email. Please try again later.');
            }
        }
        else {
            console.error('Email is null. Cannot send OTP.');
            throw new Error('User does not have a valid email address.');
        }
        return { message: 'OTP resent successfully' };
    }
};
OtpService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(otp_entity_1.OTP)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof send_email_service_1.SendEmailService !== "undefined" && send_email_service_1.SendEmailService) === "function" ? _a : Object])
], OtpService);
exports.OtpService = OtpService;
//# sourceMappingURL=otp.service.js.map