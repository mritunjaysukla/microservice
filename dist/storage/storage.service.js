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
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const decimal_js_1 = require("decimal.js");
const userStorage_entity_1 = require("./entity/userStorage.entity");
const user_service_1 = require("src/user/services/user/user.service");
const plan_service_1 = require("src/plan/plan.service");
const user_entity_1 = require("src/user/entities/user.entity");
let StorageService = class StorageService {
    constructor(userStorageRepository, userService, planService, userRepository) {
        this.userStorageRepository = userStorageRepository;
        this.userService = userService;
        this.planService = planService;
        this.userRepository = userRepository;
    }
    async saveStorageUsed(userId, storageUsed) {
        const user = await this.userService.getUserById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User  not found');
        }
        const plan = await this.planService.findOne(user.plan_id);
        if (!plan) {
            throw new common_1.NotFoundException('Plan not found');
        }
        const newStorage = new decimal_js_1.default(storageUsed);
        if (newStorage.isNegative()) {
            throw new common_1.BadRequestException('Storage used cannot be negative');
        }
        let userStorage = await this.userStorageRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!userStorage) {
            userStorage = this.userStorageRepository.create({
                user,
                plan,
                storageUsed: newStorage.toFixed(6),
                reservedStorage: newStorage.toFixed(6),
            });
        }
        else {
            const existingStorage = new decimal_js_1.default(userStorage.storageUsed);
            userStorage.storageUsed = existingStorage.plus(newStorage).toFixed(6);
        }
        return this.userStorageRepository.save(userStorage);
    }
    async getCurrentStorageUsed(userId) {
        let userStorage = await this.userStorageRepository.findOne({
            where: { user: { id: userId } },
            relations: ['plan', 'user'],
        });
        if (!userStorage) {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: {
                    subscriptions: { plan: true },
                },
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            const plan = user.subscriptions?.[0]?.plan;
            if (!plan) {
                throw new common_1.NotFoundException(`No subscription plan found for user ${userId}`);
            }
            const storageLimit = new decimal_js_1.default(plan.storage || 0);
            const newStorage = this.userStorageRepository.create({
                user,
                plan,
                storageUsed: '0.000000',
                reservedStorage: '0.000000',
            });
            await this.userStorageRepository.save(newStorage);
            return {
                storageUsed: 0,
                storageLimit: Number(storageLimit.toFixed(6)),
                storageRemaining: Number(storageLimit.toFixed(6)),
                reserverdStorage: 0,
            };
        }
        const plan = userStorage.plan;
        if (!plan) {
            throw new common_1.NotFoundException(`Plan not found for user's storage record`);
        }
        const storageLimit = new decimal_js_1.default(userStorage.storageLimit || 0);
        const storageUsed = new decimal_js_1.default(userStorage.storageUsed || 0);
        const reservedStorage = new decimal_js_1.default(userStorage.reservedStorage || 0);
        if (storageUsed.isNegative() || reservedStorage.isNegative()) {
            throw new common_1.BadRequestException('Invalid negative storage values detected');
        }
        const storageRemaining = storageLimit.minus(storageUsed);
        return {
            storageUsed: Number(storageUsed.toFixed(6)),
            storageLimit: Number(storageLimit.toFixed(6)),
            storageRemaining: Number(storageRemaining.toFixed(6)),
            reserverdStorage: Number(reservedStorage.toFixed(6)),
        };
    }
    async getTotalStorageUsed() {
        const userStorages = await this.userStorageRepository.find();
        const total = userStorages.reduce((sum, userStorage) => {
            const used = new decimal_js_1.default(userStorage.storageUsed || 0);
            if (used.isNegative()) {
                throw new common_1.BadRequestException('Negative storage detected');
            }
            return sum.plus(used);
        }, new decimal_js_1.default(0));
        return Number(total.toFixed(6));
    }
    async validateStorageAndReserveStorage(userId, totalFileSize) {
        const fileSizeDecimal = new decimal_js_1.default(totalFileSize);
        if (fileSizeDecimal.isNegative() || !fileSizeDecimal.isFinite()) {
            throw new common_1.BadRequestException('Invalid file size');
        }
        const userStorage = await this.userStorageRepository.findOne({
            where: { user: { id: userId } },
            relations: ['plan'],
        });
        if (!userStorage) {
            throw new common_1.NotFoundException('User storage not found');
        }
        const reservedStorage = new decimal_js_1.default(userStorage.reservedStorage || 0);
        const planStorageLimit = new decimal_js_1.default(userStorage.plan?.storage || 0);
        const totalReserved = reservedStorage.plus(fileSizeDecimal);
        if (totalReserved.gt(planStorageLimit)) {
            throw new common_1.BadRequestException('Storage limit exceeded');
        }
        userStorage.reservedStorage = totalReserved.toFixed(6);
        await this.userStorageRepository.save(userStorage);
        return { status: 'ok' };
    }
    async getReserverdStorage(userId) {
        const userStorage = await this.userStorageRepository
            .createQueryBuilder('us')
            .innerJoin('us.user', 'user')
            .where('user.id = :userId', { userId })
            .select(['us.reservedStorage'])
            .getOne();
        if (!userStorage) {
            throw new common_1.NotFoundException(`User storage not found`);
        }
        const reserved = new decimal_js_1.default(userStorage.reservedStorage || 0);
        if (reserved.isNegative()) {
            throw new common_1.BadRequestException('Reserved storage cannot be negative');
        }
        return reserved.toFixed(6);
    }
    async addStorageLimit(userId, additionalStorage) {
        const userStorage = await this.userStorageRepository.findOne({
            where: {
                user: { id: userId },
            },
        });
        if (!userStorage) {
            throw new common_1.NotFoundException('User storage not found');
        }
        const addition = new decimal_js_1.default(additionalStorage);
        if (addition.isNegative()) {
            throw new common_1.BadRequestException('Additional storage cannot be negative');
        }
        const limit = new decimal_js_1.default(userStorage.storageLimit);
        userStorage.storageLimit = limit.plus(addition).toString();
        return await this.userStorageRepository.save(userStorage);
    }
};
StorageService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(userStorage_entity_1.UserStorage)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => user_service_1.UserService))),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeof (_a = typeof user_service_1.UserService !== "undefined" && user_service_1.UserService) === "function" ? _a : Object, typeof (_b = typeof plan_service_1.PlanService !== "undefined" && plan_service_1.PlanService) === "function" ? _b : Object, typeorm_2.Repository])
], StorageService);
exports.StorageService = StorageService;
//# sourceMappingURL=storage.service.js.map