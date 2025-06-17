/// <reference types="multer" />
import { Repository } from 'typeorm';
import { User, Role, Status, Permission } from '../../entities/user.entity';
import { CreateAdminDto } from 'src/user/dto/create-admin.dto';
import { UploadService } from 'src/upload/upload.service';
import { Subscription } from 'src/subscription/entity/subscription.entity';
import { CreateUserDto } from '../../dto/create-user.dto';
import { PasswordService } from '../password/password.service';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from 'src/user/dto/change-password.dto';
import { CreateUserFromFacebookDto } from 'src/user/dto/create-user-from-facebook.dto';
import { CreateUserFromGoogleDto } from 'src/user/dto/create-user-from-google.dto';
import { SharedUser } from 'src/shared-user/entity/shared-user.entity';
import { TokenPasswordChangeDto } from 'src/user/dto/token-password-change.dto';
import { Upload } from 'src/backblaze/entity/upload.entity';
import { photographerClient } from 'src/user/entities/photographer-client.entity';
import { DataSource } from 'typeorm';
import { SharedUserService } from 'src/shared-user/shared-user.service';
import { MailerService } from 'src/utils/sendEmail';
import { SendEmailService } from 'src/send-email/send-email.service';
import { DatahubService } from 'src/datahub/datahub.service';
import { Project } from 'src/project/entities/project.entity';
import { ProjectsService } from 'src/project/projects.service';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
export declare class UserService {
    private usersRepository;
    private subscriptionRepository;
    private sharedUserRepository;
    private uploadRepository;
    private photographerClientRepository;
    private projectsRepository;
    private readonly passwordService;
    private readonly jwtService;
    private readonly mailerService;
    private readonly uploadService;
    private readonly dataSource;
    private readonly sharedUserService;
    private readonly sendEmailService;
    private readonly projectService;
    private readonly datahubService;
    constructor(usersRepository: Repository<User>, subscriptionRepository: Repository<Subscription>, sharedUserRepository: Repository<SharedUser>, uploadRepository: Repository<Upload>, photographerClientRepository: Repository<photographerClient>, projectsRepository: Repository<Project>, passwordService: PasswordService, jwtService: JwtService, mailerService: MailerService, uploadService: UploadService, dataSource: DataSource, sharedUserService: SharedUserService, sendEmailService: SendEmailService, projectService: ProjectsService, datahubService: DatahubService);
    getCountsByRole(): Promise<{
        [key in Role]?: number;
    }>;
    isUserExists(usernameOrEmail: string): Promise<User | null>;
    createUser(userDto: CreateUserDto): Promise<User>;
    saveUser(newUser: User): Promise<User>;
    checkUserPassword(user: User, requestPassword: string): Promise<boolean>;
    getUserToken(user: User): string;
    getAll(): Promise<User[]>;
    updateUser(id: string, updateUserDto: UpdateUserDto, file?: Express.Multer.File): Promise<User>;
    deleteUser(userId: string): Promise<{
        message: string;
    }>;
    getUserById(userId: string): Promise<any>;
    sendForgotPasswordLink(email: string): Promise<{
        message: string;
    }>;
    resetPassword(resetToken: string, newPassword: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    changePasswordWithToken(tokenPasswordChangeDto: TokenPasswordChangeDto): Promise<{
        message: string;
    }>;
    findByGoogleId(googleId: string): Promise<User | null>;
    findByFacebookId(facebookId: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    createUserFromFacebook(data: CreateUserFromFacebookDto): Promise<User>;
    createUserFromGoogle(data: CreateUserFromGoogleDto): Promise<User>;
    getAllPhotographersWithPlans(filters: {
        username?: string;
        email?: string;
        phoneNumber?: string;
        planName?: string;
        packageName?: string;
        status?: Status;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any[];
        total: number;
    }>;
    getMainClients(filters: {
        username?: string;
        email?: string;
        phoneNumber?: string;
        status?: Status;
        page?: number;
        limit?: number;
    }): Promise<{
        data: User[];
        total: number;
    }>;
    uploadAvatar(userId: string, file: Express.Multer.File): Promise<{
        message: string;
        downloadUrl: string;
    }>;
    createAdmin(createAdminDto: CreateAdminDto, file: Express.Multer.File): Promise<User>;
    getAllAdmins(filters: {
        username?: string;
        email?: string;
        phoneNumber?: string;
        status?: Status;
        permission?: Permission;
        page?: number;
        limit?: number;
    }): Promise<{
        data: User[];
        total: number;
    }>;
    getAllUsers(filters: {
        username?: string;
        email?: string;
        phoneNumber?: string;
        role?: Role;
        status?: Status;
        page?: number;
        limit?: number;
    }): Promise<{
        data: User[];
        total: number;
    }>;
    checkUsername(username: string): Promise<{
        exists: boolean;
    }>;
    validateUser(emailOrUsername: string, password: string): Promise<User | null>;
    countUsersByCreatedAt(userIds: string[], period: 'month' | 'year'): Promise<Record<string, number>>;
    getCountOfClientById(photographerId: string, period: 'month' | 'year'): Promise<{
        date: string;
        Users: number;
    }[]>;
    getPortfolioViewStats(photographerId: string, period: 'month' | 'year'): Promise<{
        date: string;
        Views: number;
    }[]>;
    isVerifiedUser(userId: string): Promise<{
        isVerified: boolean;
    }>;
    getAllClientUser(page?: number, limit?: number): Promise<{
        data: User[];
        total: number;
        page: number;
        lastPage: number;
    }>;
    getResetToken(email: string): Promise<string>;
    inactiveUser(userId: string): Promise<void>;
}
