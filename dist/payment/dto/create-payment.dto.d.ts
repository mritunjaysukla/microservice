import { PaymentMethod, PaymentStatus, PaymentType } from '../entity/payment.entity';
export declare class CreatePaymentDto {
    transactionId: string;
    subscriptionId: string;
    verification_id: string;
    amount: number;
    paymentDate: Date;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    storageAmountGB?: string;
    paymentType: PaymentType;
    user?: any;
}
