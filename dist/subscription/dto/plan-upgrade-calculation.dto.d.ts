import { Package, PlanName } from '../../plan/entity/plan.entity';
export declare class PlanDetailsDto {
    id: string;
    planName: PlanName;
    package: Package;
    monthly: number;
    threeMonths: number;
    sixMonths: number;
    yearly: number;
}
export declare class SubscriptionCalculationDto {
    amountSpent: number;
    amountRemaining: number;
    totalDays: number;
    minimumSubscriptionDaysRequired: number;
}
export declare class CalculationDetailsDto {
    daysUsed: number;
    daysRemaining: number;
    currentSubscription: SubscriptionCalculationDto;
    upgradeCosts: {
        monthly: number;
        threeMonths: number;
        sixMonths: number;
        yearly: number;
    };
}
export declare class PlanUpgradeCalculationResponseDto {
    currentPlan: PlanDetailsDto;
    newPlan: PlanDetailsDto;
    calculation: CalculationDetailsDto;
}
