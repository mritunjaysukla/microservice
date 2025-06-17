import { SubscriptionStatus } from '../entity/subscription.entity';
export declare class CreateSubscriptionDto {
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    proratedCredits: number;
    startsAt: string;
    endsAt: string;
    cancelledAt: string;
}
