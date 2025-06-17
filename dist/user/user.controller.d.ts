/// <reference types="multer" />
import { CreateUserDto } from './dto/create-user.dto';
import { AuthService } from './services/auth/auth.service';
import { LoginDto } from './dto/login.dto';
import { UserService } from './services/user/user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role, Status, User, Permission } from './entities/user.entity';
import { ForgotPasswordDto } from './dto/fogot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { TokenPasswordChangeDto } from './dto/token-password-change.dto';
import { Response } from 'express';
import { OtpService } from 'src/otp/otp.service';
import { ContactDto } from './dto/contact.dto';
import { MailerService } from 'src/utils/sendEmail';
export declare class UserController {
    private readonly authService;
    private readonly userService;
    private readonly otpService;
    private readonly mailerService;
    constructor(authService: AuthService, userService: UserService, otpService: OtpService, mailerService: MailerService);
    getPortfolioViewStats(period: 'month' | 'year', req: any): Promise<{
        date: string;
        Views: number;
    }[]>;
    getUserSession(req: any): Promise<UserSession[]>;
    getResetToken(email: string): Promise<string>;
    generate(userId: string): Promise<{
        secret: string;
        qrCode: string;
    }>;
    getQr(userId: string): Promise<string>;
    verify(secret: string, token: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getMainClients(username?: string, email?: string, phoneNumber?: string, status?: Status, page?: number, limit?: number): Promise<{
        data: User[];
        total: number;
    }>;
    getAllClientUsers(page?: string, limit?: string): Promise<{
        data: User[];
        total: number;
        page: number;
        lastPage: number;
    }>;
    getRoleCounts(): Promise<{
        photographer?: number;
        admin?: number;
        client?: number;
    }>;
    register(user: CreateUserDto): Promise<{
        user: {
            id: string;
            name: string;
            dateOfBirth: Date;
            email: string;
            username: string;
            role: Role;
            status: Status;
            isVerfied: boolean;
        };
        details: string;
    }>;
    loginNonAdmin(login: LoginDto, req: Request): Promise<{
        message: string;
        token: string;
        userSession: any;
    }>;
    loginAdmin(login: LoginDto, req: Request): Promise<{
        message: string;
        token: string;
        userSession: any;
    }>;
    getAllAdmins(username?: string, email?: string, phoneNumber?: string, status?: Status, permission?: Permission, page?: number, limit?: number): Promise<{
        data: User[];
        total: number;
    }>;
    getUsers(username?: string, email?: string, phoneNumber?: string, role?: Role, status?: Status, page?: number, limit?: number): Promise<{
        data: User[];
        total: number;
    }>;
    getMe(req: any): Promise<User>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(changePasswordDto: ChangePasswordDto, req: any): Promise<{
        message: string;
    }>;
    changePasswordWithToken(tokenPasswordChangeDto: TokenPasswordChangeDto): Promise<{
        message: string;
    }>;
    googleAuth(photographerId: string, projectId: string, res: Response): Promise<void>;
    googleAuthRedirect(req: any): Promise<{
        message: string;
        token: string;
    }>;
    facebookAuth(): Promise<void>;
    facebookAuthRedirect(req: any): Promise<{
        message: string;
        token: string;
    }>;
    getPhotographerDetails(username?: string, email?: string, phoneNumber?: string, planName?: string, packageName?: string, status?: Status, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
    }>;
    uploadAvatar(file: Express.Multer.File, req: any): Promise<{
        message: string;
        downloadUrl: string;
    }>;
    createAdmin(createAdminDto: CreateAdminDto, file: Express.Multer.File): Promise<User>;
    checkUsername(username: string): Promise<{
        exists: boolean;
    }>;
    getCountOfClients(photographerId: string, period: 'month' | 'year'): Promise<{
        error: string;
        photographerId?: undefined;
        period?: undefined;
        clientCount?: undefined;
    } | {
        photographerId: string;
        period: "year" | "month";
        clientCount: {
            date: string;
            Users: number;
        }[];
        error?: undefined;
    }>;
    updateUser(id: string, updateUserDto: UpdateUserDto, avatar?: Express.Multer.File): Promise<User>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    getUser(id: string): Promise<User>;
    verifiedUser(userId: string): Promise<{
        isVerified: boolean;
    }>;
    disableSecurity(id: string, option: '2fa' | 'passkey' | 'securityQuestion'): Promise<{
        message: string;
    }>;
    updateLocation(id: string, location: string, deviceName: string): Promise<{
        message: string;
    }>;
    deactivateUser(userId: string): Promise<void>;
    sendMessage(contactDto: ContactDto): Promise<{
        message: string;
    }>;
}
