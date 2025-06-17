import { Repository } from 'typeorm';
import { OTP } from '../../src/otp/entity/otp.entity';
import { VerifyOtpDto } from './dto/verity-otp.dto';
import { User } from 'src/user/entities/user.entity';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { SendEmailService } from 'src/send-email/send-email.service';
export declare class OtpService {
    private otpRepository;
    private userRepository;
    private mailerService;
    constructor(otpRepository: Repository<OTP>, userRepository: Repository<User>, mailerService: SendEmailService);
    findAll(): Promise<OTP[]>;
    findOne(id: string): Promise<OTP>;
    delete(otpId: string): Promise<{
        message: string;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{
        status: number;
        isVerified: boolean;
        message: string;
    }>;
    generateOtp(email: string): Promise<{
        message: string;
    }>;
    resendOtp(resendOtpDto: ResendOtpDto): Promise<{
        message: string;
    }>;
}
