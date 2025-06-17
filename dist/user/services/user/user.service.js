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
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../../entities/user.entity");
const upload_service_1 = require("src/upload/upload.service");
const subscription_entity_1 = require("src/subscription/entity/subscription.entity");
const password_service_1 = require("../password/password.service");
const jwt_1 = require("@nestjs/jwt");
const shared_user_entity_1 = require("src/shared-user/entity/shared-user.entity");
const jsonwebtoken_1 = require("jsonwebtoken");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
const photographer_client_entity_1 = require("src/user/entities/photographer-client.entity");
const typeorm_3 = require("typeorm");
const shared_user_service_1 = require("src/shared-user/shared-user.service");
const sendEmail_1 = require("src/utils/sendEmail");
const send_email_service_1 = require("src/send-email/send-email.service");
const datahub_service_1 = require("src/datahub/datahub.service");
const project_entity_1 = require("src/project/entities/project.entity");
const projects_service_1 = require("src/project/projects.service");
let UserService = class UserService {
    constructor(usersRepository, subscriptionRepository, sharedUserRepository, uploadRepository, photographerClientRepository, projectsRepository, passwordService, jwtService, mailerService, uploadService, dataSource, sharedUserService, sendEmailService, projectService, datahubService) {
        this.usersRepository = usersRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.sharedUserRepository = sharedUserRepository;
        this.uploadRepository = uploadRepository;
        this.photographerClientRepository = photographerClientRepository;
        this.projectsRepository = projectsRepository;
        this.passwordService = passwordService;
        this.jwtService = jwtService;
        this.mailerService = mailerService;
        this.uploadService = uploadService;
        this.dataSource = dataSource;
        this.sharedUserService = sharedUserService;
        this.sendEmailService = sendEmailService;
        this.projectService = projectService;
        this.datahubService = datahubService;
    }
    async getCountsByRole() {
        const counts = await this.usersRepository
            .createQueryBuilder('user')
            .select('user.role', 'role')
            .addSelect('COUNT(*)', 'count')
            .groupBy('user.role')
            .getRawMany();
        return counts.reduce((acc, { role, count }) => {
            acc[role] = parseInt(count, 10);
            return acc;
        }, {});
    }
    async isUserExists(usernameOrEmail) {
        const isEmail = usernameOrEmail.includes('@');
        return this.usersRepository.findOne({
            where: isEmail
                ? { email: usernameOrEmail.toLowerCase() }
                : { username: (0, typeorm_2.ILike)(usernameOrEmail) },
            select: ['id', 'username', 'email', 'password', 'role', 'isVerified'],
        });
    }
    async createUser(userDto) {
        return await this.dataSource.transaction(async (manager) => {
            const userPayload = {
                email: userDto.email.toLowerCase(),
                username: userDto.username,
                name: userDto.name,
                phoneNumber: userDto.phoneNumber,
                password: await this.passwordService.generate(userDto.password),
                role: userDto.role,
                googleId: userDto.googleId || null,
                token: '',
            };
            let newUser = manager.create(user_entity_1.User, userPayload);
            newUser = await manager.save(user_entity_1.User, newUser);
            if (userDto.photographerId && userPayload.role === 'client') {
                const clientPhotographer = manager.create(this.photographerClientRepository.target, {
                    photographerId: userDto.photographerId,
                    clientId: newUser.id,
                });
                await manager.save(this.photographerClientRepository.target, clientPhotographer);
            }
            newUser.token = this.getUserToken(newUser);
            const user = await manager.save(user_entity_1.User, newUser);
            if (user.email) {
                await this.sendEmailService.sendAccountCreatedMail(user.email, user.username);
            }
            return user;
        });
    }
    async saveUser(newUser) {
        return await this.usersRepository.save(newUser);
    }
    async checkUserPassword(user, requestPassword) {
        const result = await this.passwordService.compare(requestPassword, user.password);
        if (!result) {
            throw new common_1.HttpException({
                code: 'INVALID_PASSWORD',
                message: 'Password does not match',
            }, common_1.HttpStatus.UNAUTHORIZED);
        }
        return result;
    }
    getUserToken(user) {
        return this.jwtService.sign({
            id: user.id,
            email: user.email ? user.email.toLowerCase() : null,
            name: user.name,
            username: user.username,
            role: user.role,
        });
    }
    getAll() {
        return this.usersRepository.find({
            select: [
                'id',
                'email',
                'username',
                'name',
                'phoneNumber',
                'role',
                'avatar',
                'status',
            ],
        });
    }
    async updateUser(id, updateUserDto, file) {
        try {
            console.log(file);
            console.log(updateUserDto);
            const user = await this.usersRepository.findOne({
                where: { id },
                select: ['id', 'username', 'avatar'],
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            let avatarUrl;
            if (file) {
                if (user.avatar) {
                    console.log(user.avatar);
                    const existingUpload = await this.uploadRepository.findOne({
                        where: { downloadUrl: user.avatar },
                    });
                    if (existingUpload) {
                        await this.uploadService.deleteFile(existingUpload.fileId, id);
                    }
                }
                const folderPath = `${user.username}_${user.id}/avatar`;
                const uploadResult = await this.uploadService.uploadFile(file, folderPath, user.id);
                avatarUrl = uploadResult.response.downloadUrl;
            }
            const partialEntity = {};
            for (const [key, value] of Object.entries(updateUserDto)) {
                if (value !== undefined && value !== '') {
                    partialEntity[key] = value;
                }
            }
            if (avatarUrl) {
                partialEntity.avatar = avatarUrl;
            }
            await this.usersRepository.update(id, partialEntity);
            const updatedUser = await this.usersRepository.findOne({ where: { id } });
            if (!updatedUser) {
                throw new common_1.NotFoundException('User not found after update');
            }
            return updatedUser;
        }
        catch (error) {
            console.log(`Error updating user: ${error.message}`);
            throw new common_1.InternalServerErrorException('Error updating user');
        }
    }
    async deleteUser(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        const projects = await this.projectsRepository.find({
            where: { userId },
        });
        await this.projectService.archiveProject(0, projects);
        await this.usersRepository.delete(userId);
        return { message: 'User deleted successfully' };
    }
    async getUserById(userId) {
        try {
            const user = await this.usersRepository
                .createQueryBuilder('user')
                .leftJoinAndSelect('user.subscriptions', 'subscriptions')
                .leftJoinAndSelect('subscriptions.plan', 'plan')
                .where('user.id = :userId', { userId })
                .select([
                'user.id',
                'user.username',
                'user.email',
                'user.name',
                'user.phoneNumber',
                'user.role',
                'user.avatar',
                'user.status',
                'user.isVerified',
                'user.is2FaActive',
                'user.isPassKeyActive',
                'user.dateOfBirth',
                'user.isSecurityQuestionEnabled',
                'user.isKycVerified',
                'subscriptions.id',
                'subscriptions.status',
                'subscriptions.endsAt',
                'plan.planName',
                'plan.id',
                'plan.package',
                `(SELECT COUNT(project.id) FROM project WHERE project."userId" = user.id) AS "projectCount"`,
            ])
                .getRawAndEntities();
            if (!user.entities[0]) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            console.log(user.raw[0]?.projectCount);
            console.log(Object.keys(user.raw[0]));
            console.log(user.raw[0]);
            if (user.raw[0].user_avatar) {
                const avatarPath = user.raw[0].user_avatar.replace('https://s3-np1.datahub.com.np/fotosfolio/', '');
                console.log(avatarPath);
                user.entities[0].avatar =
                    await this.datahubService.generateGetPresignedUrl(avatarPath);
            }
            const activeSubscription = user.raw.find((sub) => sub.subscriptions_status === subscription_entity_1.SubscriptionStatus.ACTIVE &&
                new Date(sub.subscriptions_ends_at) > new Date());
            return {
                ...user.entities[0],
                projectCount: user.raw[0]?.projectCount || 0,
                subscription: {
                    currentSubscriptionId: activeSubscription?.subscriptions_id || null,
                    currentPackage: activeSubscription?.plan_package || null,
                    currentPlan: activeSubscription?.plan_planName || null,
                    status: activeSubscription?.subscriptions_status || 'inactive',
                    endDate: activeSubscription?.subscriptions_ends_at || null,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException)
                throw error;
            throw new common_1.InternalServerErrorException('Error retrieving user details');
        }
    }
    async sendForgotPasswordLink(email) {
        const user = await this.usersRepository.findOne({ where: { email } });
        console.log(user);
        if (!user) {
            throw new common_1.NotFoundException(`User with email ${email} not found`);
        }
        const resetToken = this.jwtService.sign({ id: user.id, email: user.email }, { expiresIn: '1h' });
        console.log('reset token', resetToken);
        const resetLink = `https://dev.fotosfolio.com/login/reset-password?token=${resetToken}`;
        await this.sendEmailService.sendPasswordResetMail(email, user.username, resetLink);
        return { message: 'Password reset link sent successfully' };
    }
    async resetPassword(resetToken, newPassword) {
        try {
            const payload = this.jwtService.verify(resetToken);
            console.log(payload);
            const user = await this.usersRepository.findOne({
                where: { id: payload.id, email: payload.email },
            });
            if (!user) {
                throw new common_1.BadRequestException('Invalid token or user not found');
            }
            const hashedPassword = await this.passwordService.generate(newPassword);
            user.password = hashedPassword;
            await this.usersRepository.save(user);
            return { message: 'Password has been reset successfully' };
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
    }
    async changePassword(userId, changePasswordDto) {
        const { currentPassword, newPassword } = changePasswordDto;
        console.log(currentPassword, newPassword);
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            select: {
                password: true,
                id: true,
            },
        });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const isPasswordValid = await this.checkUserPassword(user, currentPassword);
        console.log(isPasswordValid);
        if (!isPasswordValid) {
            throw new common_1.BadRequestException('Incorrect current password');
        }
        const hashedPassword = await this.passwordService.generate(newPassword);
        user.password = hashedPassword;
        await this.usersRepository.save(user);
        return { message: 'Password successfully updated' };
    }
    async changePasswordWithToken(tokenPasswordChangeDto) {
        try {
            const decoded = this.jwtService.verify(tokenPasswordChangeDto.token);
            if (!decoded.id) {
                throw new common_1.UnauthorizedException('Invalid token');
            }
            const user = await this.usersRepository.findOne({
                where: { id: decoded.id },
                select: ['id', 'password'],
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const hashedPassword = await this.passwordService.generate(tokenPasswordChangeDto.newPassword);
            user.password = hashedPassword;
            await this.usersRepository.save(user);
            return {
                message: 'Password changed successfully',
            };
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                throw new common_1.UnauthorizedException('Invalid or expired token');
            }
            throw error;
        }
    }
    async findByGoogleId(googleId) {
        return this.usersRepository.findOne({ where: { googleId } });
    }
    async findByFacebookId(facebookId) {
        console.log('inside findByFacebookId');
        return this.usersRepository.findOne({ where: { facebookId } });
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({ where: { email } });
    }
    async createUserFromFacebook(data) {
        const newUser = this.usersRepository.create(data);
        return this.usersRepository.save(newUser);
    }
    async createUserFromGoogle(data) {
        if (data.projectId && data.photographerId) {
            const newUser = this.usersRepository.create(data);
            const user = await this.usersRepository.save(newUser);
            const shareduser = await this.sharedUserService.createSharedUser({
                userId: user.id,
                projectId: data?.projectId,
                photographerId: data?.photographerId,
            });
            const photographerAndClient = this.photographerClientRepository.create({
                photographerId: data?.photographerId,
                clientId: user.id,
            });
            await this.photographerClientRepository.save(photographerAndClient);
            return user;
        }
        const newUser = await this.createUser(data);
        return newUser;
    }
    async getAllPhotographersWithPlans(filters) {
        const queryBuilder = this.usersRepository.createQueryBuilder('user');
        queryBuilder.where('user.role = :role', { role: user_entity_1.Role.PHOTOGRAPHER });
        if (filters.username) {
            queryBuilder.andWhere('user.username LIKE :username', {
                username: `%${filters.username}%`,
            });
        }
        if (filters.email) {
            queryBuilder.andWhere('user.email LIKE :email', {
                email: `%${filters.email}%`,
            });
        }
        if (filters.phoneNumber) {
            queryBuilder.andWhere('user.phoneNumber LIKE :phoneNumber', {
                phoneNumber: `%${filters.phoneNumber}%`,
            });
        }
        if (filters.status) {
            queryBuilder.andWhere('user.status = :status', {
                status: filters.status,
            });
        }
        const total = await queryBuilder.getCount();
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const offset = (page - 1) * limit;
        const photographers = await queryBuilder.skip(offset).take(limit).getMany();
        if (!photographers.length) {
            throw new common_1.NotFoundException('No photographers found');
        }
        const userIds = photographers.map((photographer) => photographer.id);
        const subscriptions = await this.subscriptionRepository.find({
            where: { userId: (0, typeorm_2.In)(userIds) },
            relations: ['plan'],
        });
        const result = photographers.map((photographer) => {
            const photographerPlans = subscriptions
                .filter((subscription) => subscription.userId === photographer.id)
                .map((subscription) => subscription.plan);
            return {
                photographer,
                plans: photographerPlans,
            };
        });
        if (filters.planName || filters.packageName) {
            const filteredResult = result.filter((item) => {
                return item.plans.some((plan) => {
                    return ((!filters.planName || plan.planName === filters.planName) &&
                        (!filters.packageName || plan.package === filters.packageName));
                });
            });
            return { data: filteredResult, total: filteredResult.length };
        }
        return { data: result, total };
    }
    async getMainClients(filters) {
        const queryBuilder = this.sharedUserRepository
            .createQueryBuilder('sharedUser')
            .leftJoinAndSelect('sharedUser.user', 'user')
            .where('sharedUser.clientId IS NULL');
        if (filters.username) {
            queryBuilder.andWhere('user.username LIKE :username', {
                username: `%${filters.username}%`,
            });
        }
        if (filters.email) {
            queryBuilder.andWhere('user.email LIKE :email', {
                email: `%${filters.email}%`,
            });
        }
        if (filters.phoneNumber) {
            queryBuilder.andWhere('user.phoneNumber LIKE :phoneNumber', {
                phoneNumber: `%${filters.phoneNumber}%`,
            });
        }
        if (filters.status) {
            queryBuilder.andWhere('user.status = :status', {
                status: filters.status,
            });
        }
        const total = await queryBuilder.getCount();
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const offset = (page - 1) * limit;
        const sharedUsers = await queryBuilder.skip(offset).take(limit).getMany();
        const mainClients = sharedUsers.map((sharedUser) => sharedUser.user);
        return { data: mainClients, total };
    }
    async uploadAvatar(userId, file) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        try {
            const folderPath = `${user.username}_${userId}/avatar`;
            if (user.avatar) {
                console.log(user.avatar);
                const file = await this.uploadRepository.findOne({
                    where: { downloadUrl: user.avatar },
                });
                console.log(file);
                if (file) {
                    const fileId = file.fileId;
                    console.log(fileId);
                    await this.uploadService.deleteFile(fileId, userId);
                }
                else {
                    throw new Error('Avatar not deleted');
                }
            }
            const uploadResult = await this.uploadService.uploadFile(file, folderPath, userId);
            console.log(uploadResult);
            user.avatar = uploadResult.response.downloadUrl;
            await this.usersRepository.save(user);
            console.log(user);
            return {
                message: 'Avatar uploaded successfully',
                downloadUrl: uploadResult.downloadUrl,
            };
        }
        catch (error) {
            if (error.message === 'Avatar not deleted') {
                throw new Error('Failed to delete Avatar');
            }
            else {
                throw new Error('failed to upload Avatar');
            }
        }
    }
    async createAdmin(createAdminDto, file) {
        const existingUser = await this.usersRepository.findOne({
            where: { username: createAdminDto.username },
        });
        if (existingUser) {
            throw new common_1.BadRequestException('User with this username already exists');
        }
        const adminUser = this.usersRepository.create({
            ...createAdminDto,
            role: user_entity_1.Role.ADMIN,
        });
        const savedAdminUser = await this.usersRepository.save(adminUser);
        if (file) {
            const folderPath = `${savedAdminUser.username}_${savedAdminUser.id}/avatar`;
            const uploadResult = await this.uploadService.uploadFile(file, folderPath, savedAdminUser.id);
            savedAdminUser.avatar = uploadResult.downloadUrl;
        }
        return this.usersRepository.save(savedAdminUser);
    }
    async getAllAdmins(filters) {
        const queryBuilder = this.usersRepository.createQueryBuilder('user');
        queryBuilder.where('user.role = :role', { role: user_entity_1.Role.ADMIN });
        if (filters.username) {
            queryBuilder.andWhere('user.username LIKE :username', {
                username: `%${filters.username}%`,
            });
        }
        if (filters.email) {
            queryBuilder.andWhere('user.email LIKE :email', {
                email: `%${filters.email}%`,
            });
        }
        if (filters.phoneNumber) {
            queryBuilder.andWhere('user.phoneNumber LIKE :phoneNumber', {
                phoneNumber: `%${filters.phoneNumber}%`,
            });
        }
        if (filters.status) {
            queryBuilder.andWhere('user.status = :status', {
                status: filters.status,
            });
        }
        if (filters.permission) {
            queryBuilder.andWhere('user.permission = :permission', {
                permission: filters.permission,
            });
        }
        const total = await queryBuilder.getCount();
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const offset = (page - 1) * limit;
        const admins = await queryBuilder.skip(offset).take(limit).getMany();
        return { data: admins, total };
    }
    async getAllUsers(filters) {
        const queryBuilder = this.usersRepository.createQueryBuilder('user');
        if (filters.username) {
            queryBuilder.andWhere('user.username LIKE :username', {
                username: `%${filters.username}%`,
            });
        }
        if (filters.email) {
            queryBuilder.andWhere('user.email LIKE :email', {
                email: `%${filters.email}%`,
            });
        }
        if (filters.phoneNumber) {
            queryBuilder.andWhere('user.phoneNumber LIKE :phoneNumber', {
                phoneNumber: `%${filters.phoneNumber}%`,
            });
        }
        if (filters.role) {
            queryBuilder.andWhere('user.role = :role', {
                role: filters.role,
            });
        }
        if (filters.status) {
            queryBuilder.andWhere('user.status = :status', {
                status: filters.status,
            });
        }
        queryBuilder.orderBy('user.createdAt', 'DESC');
        const total = await queryBuilder.getCount();
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const offset = (page - 1) * limit;
        const users = await queryBuilder.skip(offset).take(limit).getMany();
        return { data: users, total };
    }
    async checkUsername(username) {
        const user = await this.usersRepository.findOne({
            where: { username },
        });
        return { exists: !!user };
    }
    async validateUser(emailOrUsername, password) {
        const user = await this.isUserExists(emailOrUsername);
        if (!user) {
            return null;
        }
        const verifiedPwd = await this.checkUserPassword(user, password);
        if (!verifiedPwd) {
            return null;
        }
        return user;
    }
    async countUsersByCreatedAt(userIds, period) {
        const result = await this.usersRepository
            .createQueryBuilder('user')
            .select(`EXTRACT(${period.toUpperCase()} FROM user.created_at) AS period`)
            .addSelect('COUNT(user.id) AS count')
            .where('user.id IN (:...userIds)', { userIds })
            .groupBy('period')
            .orderBy('period')
            .getRawMany();
        return result.reduce((acc, item) => {
            acc[item.period] = Number(item.count);
            return acc;
        }, {});
    }
    async getCountOfClientById(photographerId, period) {
        const photographer = await this.usersRepository.findOne({
            where: { id: photographerId },
            relations: ['siteSetting'],
        });
        if (!photographer || !photographer.siteSetting) {
            throw new common_1.NotFoundException('Photographer or site settings not found');
        }
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const queryBuilder = this.dataSource.createQueryBuilder()
            .select(`EXTRACT(${period === 'month' ? 'MONTH' : 'YEAR'} FROM "view"."createdAt")`, 'period')
            .addSelect('COUNT("view"."id")', 'count')
            .from('portfolio_view', 'view')
            .where('view.siteSettingId = :siteSettingId', { siteSettingId: photographer.siteSetting.id });
        if (period === 'year') {
            queryBuilder.andWhere('EXTRACT(YEAR FROM "view"."createdAt") >= :startYear', { startYear: currentYear - 4 });
        }
        else {
            queryBuilder.andWhere('EXTRACT(YEAR FROM "view"."createdAt") = :year', { year: currentYear });
        }
        queryBuilder.groupBy('period')
            .orderBy('period');
        const viewsData = await queryBuilder.getRawMany();
        const monthMap = {
            '1': 'JAN', '2': 'FEB', '3': 'MAR', '4': 'APR',
            '5': 'MAY', '6': 'JUN', '7': 'JUL', '8': 'AUG',
            '9': 'SEP', '10': 'OCT', '11': 'NOV', '12': 'DEC',
        };
        if (period === 'month') {
            const result = Object.entries(monthMap).map(([monthNum, monthName]) => ({
                date: monthName,
                Users: 0,
            }));
            viewsData.forEach(item => {
                const monthIndex = parseInt(item.period) - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                    result[monthIndex].Users = parseInt(item.count);
                }
            });
            return result;
        }
        else {
            const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
            const result = years.map(year => ({
                date: year.toString(),
                Users: 0,
            }));
            viewsData.forEach(item => {
                const yearIndex = years.indexOf(parseInt(item.period));
                if (yearIndex >= 0) {
                    result[yearIndex].Users = parseInt(item.count);
                }
            });
            return result;
        }
    }
    async getPortfolioViewStats(photographerId, period) {
        const photographer = await this.usersRepository.findOne({
            where: { id: photographerId },
            relations: ['siteSetting'],
        });
        if (!photographer || !photographer.siteSetting) {
            throw new common_1.NotFoundException('Photographer or site settings not found');
        }
        const now = new Date();
        const currentYear = now.getFullYear();
        const queryBuilder = this.dataSource.createQueryBuilder()
            .select(`EXTRACT(${period === 'month' ? 'MONTH' : 'YEAR'} FROM "view"."createdAt")`, 'period')
            .addSelect('COUNT("view"."id")', 'count')
            .from('portfolio_view', 'view')
            .where('view.siteSettingId = :siteSettingId', { siteSettingId: photographer.siteSetting.id });
        if (period === 'year') {
            queryBuilder.andWhere('EXTRACT(YEAR FROM "view"."createdAt") >= :startYear', { startYear: currentYear - 4 });
        }
        else {
            queryBuilder.andWhere('EXTRACT(YEAR FROM "view"."createdAt") = :year', { year: currentYear });
        }
        queryBuilder.groupBy('period')
            .orderBy('period');
        const viewsData = await queryBuilder.getRawMany();
        const monthMap = {
            '1': 'JAN', '2': 'FEB', '3': 'MAR', '4': 'APR',
            '5': 'MAY', '6': 'JUN', '7': 'JUL', '8': 'AUG',
            '9': 'SEP', '10': 'OCT', '11': 'NOV', '12': 'DEC',
        };
        if (period === 'month') {
            const result = Object.entries(monthMap).map(([monthNum, monthName]) => ({
                date: monthName,
                Views: 0,
            }));
            viewsData.forEach(item => {
                const monthIndex = parseInt(item.period) - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                    result[monthIndex].Views = parseInt(item.count);
                }
            });
            return result;
        }
        else {
            const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
            const result = years.map(year => ({
                date: year.toString(),
                Views: 0,
            }));
            viewsData.forEach(item => {
                const yearIndex = years.indexOf(parseInt(item.period));
                if (yearIndex >= 0) {
                    result[yearIndex].Views = parseInt(item.count);
                }
            });
            return result.reverse();
        }
    }
    async isVerifiedUser(userId) {
        console.log(userId);
        try {
            const user = await this.usersRepository.findOne({
                where: {
                    id: userId,
                },
                select: ['isVerified'],
            });
            if (!user) {
                throw new Error('User not found');
            }
            return {
                isVerified: user.isVerified,
            };
        }
        catch (error) {
            console.log('Error checking user verification:', error);
            return { isVerified: false };
        }
    }
    async getAllClientUser(page = 1, limit = 10) {
        const [clients, total] = await this.usersRepository.findAndCount({
            where: { role: user_entity_1.Role.CLIENT },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            data: clients,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }
    async getResetToken(email) {
        const user = await this.usersRepository.findOne({ where: { email } });
        console.log(user);
        if (!user) {
            throw new common_1.NotFoundException(`User with email ${email} not found`);
        }
        const resetToken = this.jwtService.sign({ id: user.id, email: user.email }, { expiresIn: '5m' });
        console.log('reset token', resetToken);
        return resetToken;
    }
    async inactiveUser(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with id ${userId} not found`);
        }
        await this.usersRepository.update(userId, { status: user_entity_1.Status.INACTIVE });
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(2, (0, typeorm_1.InjectRepository)(shared_user_entity_1.SharedUser)),
    __param(3, (0, typeorm_1.InjectRepository)(upload_entity_1.Upload)),
    __param(4, (0, typeorm_1.InjectRepository)(photographer_client_entity_1.photographerClient)),
    __param(5, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        password_service_1.PasswordService,
        jwt_1.JwtService, typeof (_a = typeof sendEmail_1.MailerService !== "undefined" && sendEmail_1.MailerService) === "function" ? _a : Object, typeof (_b = typeof upload_service_1.UploadService !== "undefined" && upload_service_1.UploadService) === "function" ? _b : Object, typeorm_3.DataSource, typeof (_c = typeof shared_user_service_1.SharedUserService !== "undefined" && shared_user_service_1.SharedUserService) === "function" ? _c : Object, typeof (_d = typeof send_email_service_1.SendEmailService !== "undefined" && send_email_service_1.SendEmailService) === "function" ? _d : Object, typeof (_e = typeof projects_service_1.ProjectsService !== "undefined" && projects_service_1.ProjectsService) === "function" ? _e : Object, typeof (_f = typeof datahub_service_1.DatahubService !== "undefined" && datahub_service_1.DatahubService) === "function" ? _f : Object])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map