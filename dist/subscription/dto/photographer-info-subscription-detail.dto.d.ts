import { Role, Status } from 'src/user/entities/user.entity';
import { SubscriptionStatus } from '../entity/subscription.entity';
import { Package, PlanName } from 'src/plan/entity/plan.entity';
export declare class PhotographerSubscriptionDetailDto {
    user: {
        id: string;
        name: string;
        email: string;
        username: string;
        phoneNumber: string;
        role: Role;
        status: Status;
        avatar?: string;
        studioAddress?: string;
        occupation?: string;
        isVerified: boolean;
        createdAt: Date;
    };
    subscriptions: {
        id: string;
        status: SubscriptionStatus;
        proratedCredits: number;
        startsAt: Date;
        endsAt: Date;
        cancelledAt?: Date;
        createdAt: Date;
        plan: {
            id: string;
            package: Package;
            planName: PlanName;
            description: string;
            pricePerMonth: number;
            pricePerThreeMonth: number;
            pricePerSixMonth: number;
            pricePerYear: number;
            storage: number;
        };
    }[];
}
