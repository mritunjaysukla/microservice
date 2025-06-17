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
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("./entity/subscription.entity");
const plan_entity_1 = require("src/plan/entity/plan.entity");
const payment_entity_1 = require("src/payment/entity/payment.entity");
const user_entity_1 = require("src/user/entities/user.entity");
const rxjs_1 = require("rxjs");
const invoice_entity_1 = require("src/invoice/entity/invoice.entity");
const site_setting_entity_1 = require("src/site-setting/entity/site-setting.entity");
const date_fns_1 = require("date-fns");
const send_email_service_1 = require("src/send-email/send-email.service");
const userStorage_entity_1 = require("src/storage/entity/userStorage.entity");
let SubscriptionService = class SubscriptionService {
    constructor(subscriptionRepository, planRepository, paymentRepository, userStorageRepository, dataSource, usersRepository, mailerService) {
        this.subscriptionRepository = subscriptionRepository;
        this.planRepository = planRepository;
        this.paymentRepository = paymentRepository;
        this.userStorageRepository = userStorageRepository;
        this.dataSource = dataSource;
        this.usersRepository = usersRepository;
        this.mailerService = mailerService;
    }
    async create(createSubscriptionDto) {
        const subscription = this.subscriptionRepository.create(createSubscriptionDto);
        console.log(subscription);
        return await this.subscriptionRepository.save(subscription);
    }
    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [subscriptions, total] = await this.subscriptionRepository
            .createQueryBuilder('subscription')
            .leftJoinAndSelect('subscription.user', 'user')
            .leftJoinAndSelect('subscription.plan', 'plan')
            .select([
            'subscription.id',
            'subscription.status',
            'subscription.proratedCredits',
            'subscription.startsAt',
            'subscription.endsAt',
            'subscription.cancelledAt',
            'user.id',
            'user.name',
            'user.username',
            'user.email',
            'user.phoneNumber',
            'user.role',
            'user.avatar',
            'plan.id',
            'plan.planName',
            'plan.package',
            'plan.description',
            'plan.pricePerMonth',
            'plan.pricePerYear',
            'plan.storage',
            'plan.discountId',
        ])
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        return {
            items: subscriptions,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const subscription = await this.subscriptionRepository
            .createQueryBuilder('subscription')
            .leftJoinAndSelect('subscription.user', 'user')
            .leftJoinAndSelect('subscription.plan', 'plan')
            .select([
            'subscription.id',
            'subscription.status',
            'subscription.proratedCredits',
            'subscription.startsAt',
            'subscription.endsAt',
            'subscription.cancelledAt',
            'user.id',
            'user.name',
            'user.username',
            'user.email',
            'user.phoneNumber',
            'user.role',
            'plan.id',
            'plan.planName',
            'plan.description',
            'plan.pricePerMonth',
            'plan.pricePerYear',
            'plan.storage',
            'plan.discountId',
        ])
            .where('subscription.id = :id', { id })
            .getOne();
        if (!subscription) {
            throw new common_1.NotFoundException(`Subscription with ID ${id} not found`);
        }
        return subscription;
    }
    async update(id, updateSubscriptionDto) {
        const subscription = await this.findOne(id);
        Object.assign(subscription, updateSubscriptionDto);
        return await this.subscriptionRepository.save(subscription);
    }
    async delete(id) {
        const existingSubscription = await this.findOne(id);
        await this.subscriptionRepository.delete(existingSubscription.id);
        return { message: 'Subscription deleted successfully' };
    }
    async getActiveAndLatestEndedSubscription(userId) {
        const activeSubscription = await this.subscriptionRepository
            .createQueryBuilder('subscription')
            .leftJoinAndSelect('subscription.user', 'user')
            .leftJoinAndSelect('subscription.plan', 'plan')
            .select(['subscription', 'plan.id', 'plan.package'])
            .where('subscription.status = :status', {
            status: subscription_entity_1.SubscriptionStatus.ACTIVE,
        })
            .andWhere('subscription.userId = :userId', { userId })
            .getOne();
        const latestEndedSubscription = await this.subscriptionRepository
            .createQueryBuilder('subscription')
            .leftJoinAndSelect('subscription.user', 'user')
            .leftJoinAndSelect('subscription.plan', 'plan')
            .select(['subscription', 'plan'])
            .where('subscription.status = :status', {
            status: subscription_entity_1.SubscriptionStatus.ENDED,
        })
            .andWhere('subscription.userId = :userId', { userId })
            .orderBy('subscription.endsAt', 'DESC')
            .getOne();
        if (!activeSubscription && !latestEndedSubscription) {
            throw new common_1.NotFoundException('No active or ended subscriptions found');
        }
        return {
            activeSubscription,
            latestEndedSubscription,
        };
    }
    async getSubscriptionsByUserId(userId) {
        const subscriptions = await this.subscriptionRepository.find({
            where: { userId },
            relations: ['user', 'plan'],
        });
        if (!subscriptions.length) {
            throw new common_1.NotFoundException(`No subscriptions found for user with ID ${userId}`);
        }
        return subscriptions;
    }
    async createSubscriptionWithPayment(createSubscriptionWithPayment, userId) {
        const plan = await this.planRepository.findOne({
            where: {
                id: createSubscriptionWithPayment.planId,
            },
        });
        const user = await this.usersRepository.findOneById(userId);
        if (!user) {
            throw new rxjs_1.NotFoundError('user not found');
        }
        if (!plan) {
            throw new common_1.NotFoundException(`Plan with ID ${createSubscriptionWithPayment.planId} not found`);
        }
        const currentDate = new Date();
        console.log('currentDate', currentDate);
        const endDate = new Date(currentDate);
        endDate.setMonth(currentDate.getMonth() +
            createSubscriptionWithPayment.planDurationInMonth);
        console.log('endDate', endDate);
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            const _subscription = transactionalEntityManager.create(subscription_entity_1.Subscription, {
                userId: userId,
                planId: createSubscriptionWithPayment.planId,
                status: subscription_entity_1.SubscriptionStatus.ACTIVE,
                startsAt: currentDate,
                endsAt: endDate,
            });
            const subscription = await transactionalEntityManager.save(_subscription);
            const _payment = transactionalEntityManager.create(payment_entity_1.Payment, {
                paymentDate: createSubscriptionWithPayment.paymentDate,
                amount: createSubscriptionWithPayment.amount,
                subscriptionId: subscription.id,
                transactionId: createSubscriptionWithPayment.transactionId,
                paymentStatus: payment_entity_1.PaymentStatus.APPROVED,
                verification_id: createSubscriptionWithPayment.verificationId,
                user: {
                    id: userId,
                },
            });
            const payment = await transactionalEntityManager.save(_payment);
            const invoiceDto = {
                billedTo: user.name,
                role: user.role,
                planName: `Subscription - ${plan.package}`,
                rate: plan.pricePerMonth,
                noOfMonths: createSubscriptionWithPayment.planDurationInMonth,
                subtotal: createSubscriptionWithPayment.amount,
                discount: plan.discount?.discountValue || 0,
                total: createSubscriptionWithPayment.amount -
                    (plan.discount?.discountValue || 0),
            };
            console.log(invoiceDto);
            const _invoice = transactionalEntityManager.create(invoice_entity_1.Invoice, invoiceDto);
            const invoice = await transactionalEntityManager.save(_invoice);
            const siteSettingObj = {
                user: { id: user.id },
                watermark: undefined,
                userAgreement: undefined,
                legalAgreement: undefined,
                publishUserAgreement: true,
                publishLegalAgreement: true,
                location: undefined,
                colorSchema: site_setting_entity_1.ColorSchema.DARK,
                brandText: undefined,
                brandLogo: undefined,
                facebookLink: undefined,
                instagramLink: undefined,
                linkedinLink: undefined,
                youtubeLink: undefined,
                description: undefined,
                serviceStarted: undefined,
                totalProject: undefined,
                happyClient: undefined,
                showBrandLogo: true,
            };
            const _siteSetting = transactionalEntityManager.create(site_setting_entity_1.SiteSetting, siteSettingObj);
            const siteSetting = await transactionalEntityManager.save(_siteSetting);
            if (!user.email) {
                throw new common_1.BadRequestException('Email is required');
            }
            const userStorage = await transactionalEntityManager.save(transactionalEntityManager.create(userStorage_entity_1.UserStorage, {
                user: { id: userId },
                plan: { id: plan.id },
                storageUsed: '0',
                storageLimit: String(plan.storage),
            }));
            await this.mailerService.sendAccountActivationEmail(user.email, user.name, plan.planName);
            return {
                subscription,
                payment,
                invoiceId: invoice.id,
                siteSettingId: siteSetting.id,
            };
        });
    }
    async getPhotographerDetailedSubscriptions(userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            select: [
                'id',
                'name',
                'email',
                'username',
                'phoneNumber',
                'role',
                'status',
                'avatar',
                'studioAddress',
                'occupation',
                'isVerified',
                'createdAt',
            ],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const subscriptions = await this.subscriptionRepository
            .createQueryBuilder('subscription')
            .leftJoinAndSelect('subscription.plan', 'plan')
            .where('subscription.userId = :userId', { userId })
            .orderBy('subscription.createdAt', 'DESC')
            .take(2)
            .getMany();
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email ?? '',
                username: user.username,
                phoneNumber: user.phoneNumber,
                role: user.role,
                status: user.status,
                avatar: user.avatar,
                studioAddress: user.studioAddress,
                occupation: user.occupation,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
            },
            subscriptions: subscriptions.map((sub) => ({
                id: sub.id,
                status: sub.status,
                proratedCredits: sub.proratedCredits,
                startsAt: sub.startsAt,
                endsAt: sub.endsAt,
                cancelledAt: sub.cancelledAt,
                createdAt: sub.createdAt,
                plan: {
                    id: sub.plan.id,
                    package: sub.plan.package,
                    planName: sub.plan.planName,
                    description: sub.plan.description,
                    pricePerMonth: sub.plan.pricePerMonth,
                    pricePerThreeMonth: sub.plan.pricePerThreeMonth,
                    pricePerSixMonth: sub.plan.pricePerSixMonth,
                    pricePerYear: sub.plan.pricePerYear,
                    storage: sub.plan.storage,
                },
            })),
        };
    }
    async calculatePlanUpgrade(userId, newPlanId) {
        const activeSubscription = await this.subscriptionRepository
            .createQueryBuilder('subscription')
            .leftJoinAndSelect('subscription.plan', 'plan')
            .where('subscription.userId = :userId', { userId })
            .andWhere('subscription.status = :status', {
            status: subscription_entity_1.SubscriptionStatus.ACTIVE,
        })
            .getOne();
        if (!activeSubscription) {
            throw new common_1.NotFoundException('No active subscription found');
        }
        const newPlan = await this.planRepository.findOne({
            where: { id: newPlanId },
        });
        if (!newPlan) {
            throw new common_1.NotFoundException('New plan not found');
        }
        const currentDate = new Date();
        const subscriptionStartDate = activeSubscription.startsAt;
        const subscriptionEndDate = activeSubscription.endsAt;
        const totalDays = Math.ceil((subscriptionEndDate.getTime() - subscriptionStartDate.getTime()) /
            (1000 * 60 * 60 * 24));
        const daysUsed = Math.min(totalDays, Math.ceil((currentDate.getTime() - subscriptionStartDate.getTime()) /
            (1000 * 60 * 60 * 24)));
        const daysRemaining = Math.max(0, totalDays - daysUsed);
        const currentPlanPricing = {
            monthly: activeSubscription.plan.pricePerMonth || 0,
            threeMonths: activeSubscription.plan.pricePerThreeMonth || 0,
            sixMonths: activeSubscription.plan.pricePerSixMonth || 0,
            yearly: activeSubscription.plan.pricePerYear || 0,
        };
        const newPlanPricing = {
            monthly: newPlan.pricePerMonth || 0,
            threeMonths: newPlan.pricePerThreeMonth || 0,
            sixMonths: newPlan.pricePerSixMonth || 0,
            yearly: newPlan.pricePerYear || 0,
        };
        const newPlanDailyRate = this.calculateNewPlanDailyRate(newPlan);
        const currentPlanDailyRate = this.calculateCurrentPlanDailyRate(activeSubscription.plan, daysRemaining);
        const amountSpent = currentPlanDailyRate * daysUsed;
        const amountRemaining = currentPlanDailyRate * daysRemaining;
        const totalPaidForCurrentPlan = this.getCurrentPlanTotalAmount(activeSubscription.plan, totalDays);
        const upgradeCosts = {
            monthly: this.calculateUpgradeCost(newPlanPricing.monthly, totalPaidForCurrentPlan, amountSpent, newPlanDailyRate),
            threeMonths: this.calculateUpgradeCost(newPlanPricing.threeMonths, totalPaidForCurrentPlan, amountSpent, newPlanDailyRate),
            sixMonths: this.calculateUpgradeCost(newPlanPricing.sixMonths, totalPaidForCurrentPlan, amountSpent, newPlanDailyRate),
            yearly: this.calculateUpgradeCost(newPlanPricing.yearly, totalPaidForCurrentPlan, amountSpent, newPlanDailyRate),
        };
        console.log(upgradeCosts);
        const formattedUpgradeCosts = Object.keys(upgradeCosts).reduce((acc, key) => {
            const upgradeCost = upgradeCosts[key];
            if (typeof upgradeCost === 'object') {
                acc[key] = {
                    days: upgradeCost.totalDays,
                };
            }
            else {
                acc[key] = upgradeCost;
            }
            return acc;
        }, {});
        const minimumSubscriptionRequiredDate = Math.max(...Object.values(formattedUpgradeCosts).map((cost) => typeof cost === 'number' ? cost : cost.days));
        const adjustedUpgradeCosts = Object.keys(upgradeCosts).reduce((acc, key) => {
            const cost = upgradeCosts[key];
            console.log(cost);
            acc[key] =
                typeof cost === 'object' ? 0 : cost;
            return acc;
        }, {});
        return {
            currentPlan: {
                id: activeSubscription.plan.id,
                planName: activeSubscription.plan.planName,
                package: activeSubscription.plan.package,
                ...currentPlanPricing,
            },
            newPlan: {
                id: newPlan.id,
                planName: newPlan.planName,
                package: newPlan.package,
                ...newPlanPricing,
            },
            calculation: {
                daysUsed,
                daysRemaining,
                currentSubscription: {
                    amountSpent: Number(amountSpent.toFixed(2)),
                    amountRemaining: Number(amountRemaining.toFixed(2)),
                    totalDays,
                    minimumSubscriptionDaysRequired: minimumSubscriptionRequiredDate,
                },
                upgradeCosts: adjustedUpgradeCosts,
            },
        };
    }
    calculateNewPlanDailyRate(plan) {
        const planDetails = {
            monthly: { price: plan.pricePerMonth, days: 30 },
            '3months': { price: plan.pricePerThreeMonth, days: 90 },
            '6months': { price: plan.pricePerSixMonth, days: 180 },
            '12months': { price: plan.pricePerYear, days: 365 },
        };
        const planDetail = planDetails[plan.planName];
        if (!planDetail) {
            throw new Error(`Unknown plan name: ${plan.planName}`);
        }
        console.log(planDetail);
        return Number(planDetail.price) / planDetail.days;
    }
    calculateCurrentPlanDailyRate(plan, totalDays) {
        let price;
        if (totalDays <= 30) {
            price = Number(plan.pricePerMonth);
        }
        else if (totalDays <= 90) {
            price = Number(plan.pricePerThreeMonth);
        }
        else if (totalDays <= 180) {
            price = Number(plan.pricePerSixMonth);
        }
        else {
            price = Number(plan.pricePerYear);
        }
        return price / totalDays;
    }
    getCurrentPlanTotalAmount(plan, totalDays) {
        if (totalDays <= 30) {
            return Number(plan.pricePerMonth);
        }
        else if (totalDays <= 90) {
            return Number(plan.pricePerThreeMonth);
        }
        else if (totalDays <= 180) {
            return Number(plan.pricePerSixMonth);
        }
        else {
            return Number(plan.pricePerYear);
        }
    }
    calculateUpgradeCost(newPlanPrice, currentPlanTotalPrice, amountSpent, dailyRate) {
        if (!newPlanPrice)
            return 0;
        const unusedAmount = Math.max(0, currentPlanTotalPrice - amountSpent);
        const remainingBalance = newPlanPrice - unusedAmount;
        const totalDays = Math.floor(unusedAmount / dailyRate);
        console.log(totalDays);
        console.log(unusedAmount, dailyRate);
        if (remainingBalance < 0) {
            return {
                message: `Unused credit covers ${totalDays} day(s) in total`,
                totalDays,
            };
        }
        return Math.max(0, remainingBalance);
    }
    async upgradePlan(userId, upgradePlanDto) {
        const user = await this.usersRepository.findOneById(userId);
        if (!user) {
            throw new rxjs_1.NotFoundError('user not found');
        }
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            const activeSubscription = await this.subscriptionRepository.findOne({
                where: {
                    userId,
                    status: subscription_entity_1.SubscriptionStatus.ACTIVE,
                },
                relations: ['plan'],
            });
            if (!activeSubscription) {
                throw new common_1.NotFoundException('No active subscription found');
            }
            const newPlan = await this.planRepository.findOne({
                where: { id: upgradePlanDto.newPlanId },
            });
            if (!newPlan) {
                throw new common_1.NotFoundException(`Plan with ID ${upgradePlanDto.newPlanId} not found`);
            }
            const currentDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + upgradePlanDto.planDurationInMonth);
            const newSubscription = transactionalEntityManager.create(subscription_entity_1.Subscription, {
                userId,
                planId: upgradePlanDto.newPlanId,
                status: subscription_entity_1.SubscriptionStatus.INACTIVE,
                startsAt: currentDate,
                endsAt: endDate,
            });
            const subscription = await transactionalEntityManager.save(newSubscription);
            const payment = transactionalEntityManager.create(payment_entity_1.Payment, {
                paymentDate: upgradePlanDto.paymentDate,
                amount: upgradePlanDto.amount,
                subscriptionId: subscription.id,
                transactionId: upgradePlanDto.transactionId,
                paymentStatus: payment_entity_1.PaymentStatus.PENDING,
                paymentMethod: upgradePlanDto.paymentMethod,
                verification_id: upgradePlanDto.verificationId,
                user: { id: userId },
            });
            await transactionalEntityManager.save(payment);
            const getSubtotalAndTotal = (planDuration, newPlan, discount) => {
                switch (planDuration) {
                    case 1:
                        return {
                            subtotal: newPlan.pricePerMonth,
                            total: newPlan.pricePerMonth - discount,
                        };
                    case 3:
                        return {
                            subtotal: newPlan.pricePerThreeMonth,
                            total: newPlan.pricePerThreeMonth - discount,
                        };
                    case 6:
                        return {
                            subtotal: newPlan.pricePerSixMonth,
                            total: newPlan.pricePerSixMonth - discount,
                        };
                    case 12:
                        return {
                            subtotal: newPlan.pricePerYear,
                            total: newPlan.pricePerYear - discount,
                        };
                    default:
                        throw new Error('Invalid plan duration');
                }
            };
            const discountValue = newPlan.discount?.discountValue || 0;
            const { subtotal, total } = getSubtotalAndTotal(upgradePlanDto.planDurationInMonth, newPlan, discountValue);
            const invoiceDto = {
                billedTo: user.name,
                role: user.role,
                planName: `Subscription - ${newPlan.package}`,
                rate: newPlan.pricePerMonth,
                noOfMonths: upgradePlanDto.planDurationInMonth,
                subtotal,
                discount: discountValue,
                total,
            };
            console.log(invoiceDto);
            const _invoice = transactionalEntityManager.create(invoice_entity_1.Invoice, invoiceDto);
            const invoice = await transactionalEntityManager.save(_invoice);
            const userStorage = await this.userStorageRepository.findOne({
                where: { user: { id: userId } },
            });
            const currentLimit = userStorage ? Number(userStorage.storageLimit) : 0;
            const newLimit = Number(newPlan.storage);
            const updatedLimit = Math.max(currentLimit, newLimit);
            if (userStorage) {
                userStorage.plan = { id: newPlan.id };
                userStorage.storageLimit = String(updatedLimit);
                await transactionalEntityManager.save(userStorage);
            }
            else {
                const newUserStorage = transactionalEntityManager.create(userStorage_entity_1.UserStorage, {
                    user: { id: userId },
                    plan: { id: newPlan.id },
                    storageUsed: '0',
                    storageLimit: String(newLimit),
                });
                await transactionalEntityManager.save(newUserStorage);
            }
            if (!user.email) {
                throw new common_1.BadRequestException('Email is required');
            }
            await this.mailerService.sendSubscriptionCreatedEmail(user.email, user.name, newPlan.planName, currentDate, endDate, subscription.status);
            return { subscription, payment, invoiceId: invoice.id };
        });
    }
    async sendExpirationEmails() {
        const today = new Date();
        const sevenDaysBeforeExpiration = new Date(today);
        sevenDaysBeforeExpiration.setDate(today.getDate() + 7);
        const threeDaysBeforeExpiration = new Date(today);
        threeDaysBeforeExpiration.setDate(today.getDate() + 3);
        const sevenStart = (0, date_fns_1.startOfDay)(sevenDaysBeforeExpiration);
        const sevenEnd = (0, date_fns_1.endOfDay)(sevenDaysBeforeExpiration);
        const threeStart = (0, date_fns_1.startOfDay)(threeDaysBeforeExpiration);
        const threeEnd = (0, date_fns_1.endOfDay)(threeDaysBeforeExpiration);
        const subscriptions = await this.subscriptionRepository
            .createQueryBuilder('subscription')
            .leftJoinAndSelect('subscription.user', 'user')
            .where('subscription.status = :status', { status: 'active' })
            .andWhere(new typeorm_2.Brackets((qb) => {
            qb.where('subscription.endsAt BETWEEN :sevenStart AND :sevenEnd', {
                sevenStart: sevenStart.toISOString(),
                sevenEnd: sevenEnd.toISOString(),
            }).orWhere('subscription.endsAt BETWEEN :threeStart AND :threeEnd', {
                threeStart: threeStart.toISOString(),
                threeEnd: threeEnd.toISOString(),
            });
        }))
            .getMany();
        console.log(subscriptions);
        for (const subscription of subscriptions) {
            if (!subscription.user.email) {
                throw new Error('User email is missing');
            }
            const endsAtDate = new Date(subscription.endsAt);
            const isSeven = (0, date_fns_1.isWithinInterval)(endsAtDate, {
                start: sevenStart,
                end: sevenEnd,
            });
            const isThree = (0, date_fns_1.isWithinInterval)(endsAtDate, {
                start: threeStart,
                end: threeEnd,
            });
            const daysRemaining = isSeven ? '7' : isThree ? '3' : 'a few';
            await this.mailerService.sendSubscriptionExpirationReminderEmail(subscription.user.email, subscription.user.name, daysRemaining);
        }
    }
};
SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(1, (0, typeorm_1.InjectRepository)(plan_entity_1.Plan)),
    __param(2, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(3, (0, typeorm_1.InjectRepository)(userStorage_entity_1.UserStorage)),
    __param(4, (0, typeorm_1.InjectDataSource)()),
    __param(5, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        typeorm_2.Repository, typeof (_a = typeof send_email_service_1.SendEmailService !== "undefined" && send_email_service_1.SendEmailService) === "function" ? _a : Object])
], SubscriptionService);
exports.SubscriptionService = SubscriptionService;
//# sourceMappingURL=subscription.service.js.map