import { PlanName, Package } from '../entity/plan.entity';
export declare class CreatePlanDto {
    planName: PlanName;
    package: Package;
    description: string;
    pricePerMonth: number;
    pricePerYear: number;
    pricePerThreeMonth: number;
    pricePerSixMonth: number;
    storage: number;
    discountId?: string;
    isFree: boolean;
    feature: string[];
    isPopular: boolean;
}
