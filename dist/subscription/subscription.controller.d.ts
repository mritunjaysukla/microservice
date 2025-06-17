import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { SubscriptionService } from './subscription.service';
import { Subscription } from './entity/subscription.entity';
import { CreateSubscriptionWithPaymentDto } from './dto/create-subscription-with-payment.dto';
import { CalculatePlanUpgradeDto } from './dto/calculate-plan-upgrade.dto';
import { UpgradePlanDto } from './dto/upgrade-plan.dto';
import { Payment } from 'src/payment/entity/payment.entity';
import { PaginatedSubscriptionResponse, PaginationDto } from './dto/pagination.dto';
import { PlanUpgradeCalculationResponseDto } from './dto/plan-upgrade-calculation.dto';
export declare class SubscriptionController {
    private readonly subscriptionService;
    constructor(subscriptionService: SubscriptionService);
    sendEmail(): Promise<void>;
    calculatePlanUpgrade(req: any, calculatePlanUpgradeDto: CalculatePlanUpgradeDto): Promise<PlanUpgradeCalculationResponseDto>;
    create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription>;
    createSubscriptionWithPayment(createSubscriptionWithPayment: CreateSubscriptionWithPaymentDto, req: any): Promise<{
        subscription: Subscription;
        payment: unknown;
        invoiceId: any;
        siteSettingId: any;
    }>;
    findAll(paginationDto: PaginationDto): Promise<PaginatedSubscriptionResponse>;
    findOne(id: string): Promise<Subscription>;
    update(id: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getActiveAndLatestEndedSubscription(userId: string): Promise<{
        activeSubscription: Subscription;
        latestEndedSubscription: Subscription;
    }>;
    getSubscriptionsByUserId(userId: string): Promise<Subscription[]>;
    getUserDetailedSubscriptions(userId: string): Promise<any>;
    upgradePlan(req: any, upgradePlanDto: UpgradePlanDto): Promise<{
        subscription: Subscription;
        payment: Payment;
        invoiceId: string;
    }>;
}
