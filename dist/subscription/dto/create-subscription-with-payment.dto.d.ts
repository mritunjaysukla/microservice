import { PaymentMethod } from 'src/payment/entity/payment.entity';
export declare class CreateSubscriptionWithPaymentDto {
    planId: string;
    planDurationInMonth: number;
    transactionId: string;
    verificationId: string;
    amount: number;
    paymentDate: Date;
    paymentMethod?: PaymentMethod;
}
