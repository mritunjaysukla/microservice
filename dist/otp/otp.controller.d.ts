import { OtpService } from './otp.service';
import { OTP } from './entity/otp.entity';
import { VerifyOtpDto } from './dto/verity-otp.dto';
import { GenerateOtpDto } from './dto/generate-otp.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { Response } from 'express';
import { AuthService } from 'src/user/services/auth/auth.service';
export declare class OtpController {
    private readonly otpService;
    private readonly authService;
    constructor(otpService: OtpService, authService: AuthService);
    findAll(): Promise<OTP[]>;
    findOne(id: string): Promise<OTP>;
    remove(id: string): Promise<{
        message: string;
    }>;
    verifyOtp(verifyOtpDto: VerifyOtpDto, response: Response): Promise<Response<any, Record<string, any>>>;
    generateOtp(generateOtpDto: GenerateOtpDto): Promise<{
        message: string;
    }>;
    resendOtp(resendOtpDto: ResendOtpDto): Promise<{
        message: string;
    }>;
    verify2FAOtp(verifyOtpDto: VerifyOtpDto, response: Response): Promise<void>;
}
