import { CreateUserDto } from '../../dto/create-user.dto';
import { UserService } from '../user/user.service';
import { LoginDto } from '../../dto/login.dto';
import { User } from '../../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { SharedUserService } from 'src/shared-user/shared-user.service';
import { OtpService } from 'src/otp/otp.service';
import { Repository } from 'typeorm';
import { UserSession } from 'src/user/entities/user-session.entity';
export declare class AuthService {
    private readonly userService;
    private readonly jwtService;
    private readonly sharedUserService;
    private readonly otpService;
    private readonly userRepository;
    private readonly userSessionRepo;
    constructor(userService: UserService, jwtService: JwtService, sharedUserService: SharedUserService, otpService: OtpService, userRepository: Repository<User>, userSessionRepo: Repository<UserSession>);
    register(userDto: CreateUserDto): Promise<{
        userInfo: User;
        message: string;
    }>;
    login(loginRequest: LoginDto, req: any): Promise<void | {
        token: string;
        userSession: any;
    }>;
    private trackUserSession;
    private getModelCodeFromUserAgent;
    private failLogin;
    generateToken(user: User): string;
    generate2FASecret(userId: string): Promise<{
        secret: string;
        qrCode: string;
    }>;
    generateQRCode(userId: string): Promise<string>;
    verify2FACode(userId: string, token: string): Promise<boolean>;
    private getClientIp;
    getAllUserSession(userId: string, page?: number, pageSize?: number): Promise<UserSession[]>;
    disableSecurityOption(userId: string, option: '2fa' | 'passkey' | 'securityQuestion'): Promise<{
        message: string;
    }>;
    enableSecurityOption(userId: string, option: '2fa' | 'passkey' | 'securityQuestion'): Promise<{
        message: string;
    }>;
    updateLocation(id: string, location: string, deviceName: string): Promise<void>;
}
