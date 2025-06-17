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
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("./entity/payment.entity");
const user_entity_1 = require("src/user/entities/user.entity");
const plan_entity_1 = require("src/plan/entity/plan.entity");
const invoice_entity_1 = require("src/invoice/entity/invoice.entity");
const subscription_entity_1 = require("src/subscription/entity/subscription.entity");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
const send_email_service_1 = require("src/send-email/send-email.service");
const storage_service_1 = require("src/storage/storage.service");
let PaymentService = class PaymentService {
    constructor(paymentRepository, userRepository, planRepository, invoiceRepository, subscriptionRepository, configService, mailerService, storageService) {
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.planRepository = planRepository;
        this.invoiceRepository = invoiceRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.configService = configService;
        this.mailerService = mailerService;
        this.storageService = storageService;
        this.paymentStrategies = {
            esewa: (id, amount) => this.verifyEsewaPayment(id, amount),
            khalti: (id, amount) => this.verifyEsewaPayment(id, amount),
            bank: (id, amount) => this.verifyEsewaPayment(id, amount),
        };
    }
    async create(createPaymentDto) {
        try {
            const payment = this.paymentRepository.create({
                ...createPaymentDto,
                user: createPaymentDto.user?.id,
            });
            return await this.paymentRepository.save(payment);
        }
        catch (error) {
            throw new common_1.HttpException(`Failed to create payment: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        const payment = await this.paymentRepository.findOne({
            where: { id },
            relations: ['subscription', 'subscription.user'],
        });
        if (!payment) {
            throw new common_1.NotFoundException(`Payment with ID ${id} not found`);
        }
        return payment;
    }
    async update(id, updatePaymentDto) {
        const payment = await this.findOne(id);
        Object.assign(payment, updatePaymentDto);
        return await this.paymentRepository.save(payment);
    }
    async delete(id) {
        const existingPayment = await this.findOne(id);
        await this.paymentRepository.delete(existingPayment.id);
        return { message: 'Payment deleted successfully' };
    }
    async getAllPaymentDetails(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [payments, total] = await this.paymentRepository
            .createQueryBuilder('payment')
            .leftJoinAndSelect('payment.subscription', 'subscription')
            .leftJoinAndSelect('subscription.user', 'user')
            .leftJoinAndSelect('subscription.plan', 'plan')
            .skip(skip)
            .take(limit)
            .getManyAndCount();
        const results = payments.map((payment) => ({
            ...payment,
            subscription: {
                user: {
                    id: payment.subscription.user.id,
                    username: payment.subscription.user.username,
                    email: payment.subscription.user.email,
                },
                plan: {
                    id: payment.subscription.plan.id,
                    planName: payment.subscription.plan.planName,
                    package: payment.subscription.plan.package,
                },
            },
        }));
        return {
            data: results,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async verifyPayment(method, paymentId, paymentAmount) {
        const verifyFn = this.paymentStrategies[method];
        if (!verifyFn) {
            throw new common_1.BadRequestException('Invalid payment method');
        }
        return verifyFn(paymentId, paymentAmount);
    }
    async verifyEsewaPayment(paymentId, paymentAmount) {
        const esewaUrl = process.env.ESEWA_URL;
        const merchantCode = process.env.ESEWA_MERCHANT_ID;
        if (!esewaUrl || !merchantCode) {
            throw new common_1.HttpException('eSewa credentials missing', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
        try {
            console.log('Verifying payment:', { paymentId, paymentAmount });
            const { data } = await axios_1.default.get(esewaUrl, {
                params: {
                    product_code: merchantCode,
                    total_amount: paymentAmount,
                    transaction_uuid: paymentId,
                },
                timeout: 5000,
            });
            console.log('eSewa Response:', data);
            let paymentStatus = 'failed';
            if (data?.status) {
                if (data.status === 'COMPLETE')
                    paymentStatus = 'paid';
                else if (data.status === 'PENDING' || data.status === 'AMBIGUOUS')
                    paymentStatus = 'unpaid';
                else if (data.status === 'NOT_FOUND' || data.status === 'CANCELED')
                    paymentStatus = 'failed';
            }
            return { transactionId: paymentId, paymentStatus };
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error('eSewa Verification Error:', error.response?.data || error.message);
                if (error.code === 'ECONNABORTED') {
                    throw new common_1.HttpException('Verification timeout', common_1.HttpStatus.REQUEST_TIMEOUT);
                }
            }
            else {
                console.error('Verification failed:', error.message);
            }
            throw new common_1.HttpException('Verification failed', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getPaymentsWithStatus(paymentStatus, page = 1, limit = 10) {
        const [payments, total] = await this.paymentRepository.findAndCount({
            where: { paymentStatus },
            relations: {
                subscription: {
                    user: true,
                    plan: true,
                },
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        const data = payments.map((payment) => ({
            id: payment.id,
            transactionId: payment.transactionId,
            subscriptionId: payment.subscriptionId,
            verification_id: payment.verification_id,
            amount: payment.amount,
            paymentDate: payment.paymentDate.toISOString(),
            paymentStatus: payment.paymentStatus,
            paymentMethod: payment.paymentMethod,
            createdAt: payment.createdAt.toISOString(),
            subscription: {
                user: {
                    id: payment.subscription.user.id,
                    username: payment.subscription.user.username,
                    email: payment.subscription.user.email,
                    avatar: payment.subscription.user.avatar,
                },
                plan: {
                    id: payment.subscription.plan.id,
                    planName: payment.subscription.plan.planName,
                    package: payment.subscription.plan.package,
                },
            },
        }));
        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async updatePaymentStatus(paymentId, status, paymentType, oldSubscriptionId) {
        const payment = await this.paymentRepository.findOne({
            where: { id: paymentId },
            relations: {
                subscription: {
                    user: true,
                    plan: true,
                },
            },
        });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        payment.paymentStatus = status;
        const updatedPayment = await this.paymentRepository.save(payment);
        console.log('Payment status updated:', updatedPayment);
        if (status === 'approved') {
            if (paymentType === payment_entity_1.PaymentType.SUBSCRIPTION) {
                payment.subscription.status = subscription_entity_1.SubscriptionStatus.ACTIVE;
                await this.subscriptionRepository.save(payment.subscription);
                const oldSubscription = await this.subscriptionRepository.findOne({
                    where: { id: oldSubscriptionId },
                });
                if (oldSubscription) {
                    oldSubscription.status = subscription_entity_1.SubscriptionStatus.UPGRADED;
                    await this.subscriptionRepository.save(oldSubscription);
                }
                if (payment.subscription.user.email &&
                    payment.subscription.plan.planName) {
                    await this.mailerService.sendPaymentSuccessEmail(payment.subscription.user.email, payment.subscription.user.username, payment.subscription.plan.planName);
                    await this.mailerService.sendAccountActivationEmail(payment.subscription.user.email, payment.subscription.user.username, payment.subscription.plan.planName);
                }
            }
            else {
                const addStorageLimit = await this.storageService.addStorageLimit(payment.subscription.user.id, payment.storageAmountGB);
            }
        }
        else {
            if (payment.subscription.user.email &&
                payment.subscription.plan.planName) {
                await this.mailerService.sendPaymentRejectionEmail(payment.subscription.user.email, payment.subscription.user.username, payment.subscription.plan.planName);
            }
        }
        const { id, transactionId, subscriptionId, verification_id, amount, paymentDate, paymentStatus, paymentMethod, createdAt, subscription, } = updatedPayment;
        return {
            id,
            transactionId,
            subscriptionId,
            verification_id,
            amount,
            paymentDate: paymentDate.toISOString(),
            paymentStatus,
            paymentMethod,
            createdAt: createdAt.toISOString(),
            subscription: {
                user: {
                    id: subscription.user.id,
                    username: subscription.user.username,
                    email: subscription.user.email,
                    avatar: subscription.user.avatar,
                },
                plan: {
                    id: subscription.plan.id,
                    planName: subscription.plan.planName,
                    package: subscription.plan.package,
                },
            },
        };
    }
};
PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(plan_entity_1.Plan)),
    __param(3, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(4, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService, typeof (_a = typeof send_email_service_1.SendEmailService !== "undefined" && send_email_service_1.SendEmailService) === "function" ? _a : Object, typeof (_b = typeof storage_service_1.StorageService !== "undefined" && storage_service_1.StorageService) === "function" ? _b : Object])
], PaymentService);
exports.PaymentService = PaymentService;
//# sourceMappingURL=payment.service.js.map