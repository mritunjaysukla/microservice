import { User } from '../../user/entities/user.entity';
import { Plan } from '../../plan/entity/plan.entity';
import { Payment } from '../../payment/entity/payment.entity';
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    UPGRADED = "upgraded",
    DOWNGRADED = "downgraded",
    ENDED = "ended"
}
export declare class Subscription {
    id: string;
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    proratedCredits: number;
    startsAt: Date;
    endsAt: Date;
    cancelledAt?: Date;
    cancelledReason?: string;
    createdAt: Date;
    updatedAt: Date;
    plan: Plan;
    user: User;
    payments: Payment[];
}
