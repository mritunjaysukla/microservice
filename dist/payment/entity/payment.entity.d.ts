import { User } from '../../user/entities/user.entity';
import { Subscription } from '../../../src/subscription/entity/subscription.entity';
export declare enum PaymentStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare enum PaymentMethod {
    ESEWA = "esewa",
    KHALTI = "khalti",
    BANK = "bank"
}
export declare enum PaymentType {
    SUBSCRIPTION = "subscription",
    STORAGE = "storage",
    DOMAIN = "domain"
}
export declare class Payment {
    id: string;
    transactionId: string;
    subscriptionId: string;
    verification_id: string;
    amount: number;
    user: User;
    subscription: Subscription;
    paymentDate: Date;
    paymentStatus: PaymentStatus;
    paymentMethod: PaymentMethod;
    paymentType: PaymentType;
    storageAmountGB: string;
    createdAt: Date;
}
