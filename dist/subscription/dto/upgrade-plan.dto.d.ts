import { PaymentMethod } from 'src/payment/entity/payment.entity';
export declare class UpgradePlanDto {
    newPlanId: string;
    planDurationInMonth: number;
    transactionId: string;
    amount: number;
    paymentDate: Date;
    paymentMethod?: PaymentMethod;
    verificationId?: string;
}
