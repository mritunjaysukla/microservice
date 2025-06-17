import { DiscountType } from '../entity/discount.entity';
export declare class CreateDiscountDto {
    discountName: string;
    discountType: DiscountType;
    discountValue: number;
    startDate: string;
    endDate: string;
}
