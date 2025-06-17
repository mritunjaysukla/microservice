import { Subscription } from '../../subscription/entity/subscription.entity';
import { Discount } from '../../discount/entity/discount.entity';
export declare enum PlanName {
    MONTHLY = "monthly",
    THREE_MONTHS = "3months",
    SIX_MONTHS = "6months",
    TWELVE_MONTHS = "12months"
}
export declare enum Package {
    STARTER = "starter",
    CREATOR = "creator",
    PRO = "pro",
    ELITE = "elite"
}
export declare class Plan {
    id: string;
    package: Package;
    planName: PlanName;
    description: string;
    pricePerMonth: number;
    pricePerThreeMonth: number;
    pricePerSixMonth: number;
    pricePerYear: number;
    storage: number;
    discountId?: string;
    isFree: boolean;
    feature: string[];
    isPopular: boolean;
    subscriptions: Subscription[];
    discount?: Discount;
}
