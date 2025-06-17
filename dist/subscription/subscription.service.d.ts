import { DataSource, Repository } from 'typeorm';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription } from './entity/subscription.entity';
import { CreateSubscriptionWithPaymentDto } from './dto/create-subscription-with-payment.dto';
import { Plan } from 'src/plan/entity/plan.entity';
import { Payment } from 'src/payment/entity/payment.entity';
import { User } from 'src/user/entities/user.entity';
import { PhotographerSubscriptionDetailDto } from './dto/photographer-info-subscription-detail.dto';
import { UpgradePlanDto } from './dto/upgrade-plan.dto';
import { PaginatedSubscriptionResponse } from './dto/pagination.dto';
import { PlanUpgradeCalculationResponseDto } from './dto/plan-upgrade-calculation.dto';
import { SendEmailService } from 'src/send-email/send-email.service';
import { UserStorage } from 'src/storage/entity/userStorage.entity';
export declare class SubscriptionService {
    private readonly subscriptionRepository;
    private readonly planRepository;
    private readonly paymentRepository;
    private readonly userStorageRepository;
    private dataSource;
    private readonly usersRepository;
    private readonly mailerService;
    constructor(subscriptionRepository: Repository<Subscription>, planRepository: Repository<Plan>, paymentRepository: Repository<Payment>, userStorageRepository: Repository<UserStorage>, dataSource: DataSource, usersRepository: Repository<User>, mailerService: SendEmailService);
    create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription>;
    findAll(page?: number, limit?: number): Promise<PaginatedSubscriptionResponse>;
    findOne(id: string): Promise<Subscription>;
    update(id: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription>;
    delete(id: string): Promise<{
        message: string;
    }>;
    getActiveAndLatestEndedSubscription(userId: string): Promise<{
        activeSubscription: Subscription;
        latestEndedSubscription: Subscription;
    }>;
    getSubscriptionsByUserId(userId: string): Promise<Subscription[]>;
    createSubscriptionWithPayment(createSubscriptionWithPayment: CreateSubscriptionWithPaymentDto, userId: string): Promise<{
        subscription: Subscription;
        payment: unknown;
        invoiceId: any;
        siteSettingId: any;
    }>;
    getPhotographerDetailedSubscriptions(userId: string): Promise<PhotographerSubscriptionDetailDto>;
    calculatePlanUpgrade(userId: string, newPlanId: string): Promise<PlanUpgradeCalculationResponseDto>;
    private calculateNewPlanDailyRate;
    private calculateCurrentPlanDailyRate;
    private getCurrentPlanTotalAmount;
    private calculateUpgradeCost;
    upgradePlan(userId: string, upgradePlanDto: UpgradePlanDto): Promise<{
        subscription: Subscription;
        payment: unknown;
        invoiceId: any;
    }>;
    sendExpirationEmails(): Promise<void>;
}
