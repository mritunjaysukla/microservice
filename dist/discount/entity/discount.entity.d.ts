import { Invoice } from '../../invoice/entity/invoice.entity';
import { Plan } from '../../plan/entity/plan.entity';
export declare enum DiscountType {
    PERCENTAGE = "percentage",
    FIXED = "fixed"
}
export declare class Discount {
    id: string;
    discountName: string;
    discountType: DiscountType;
    discountValue: number;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
    plans: Plan[];
    invoices: Invoice[];
}
