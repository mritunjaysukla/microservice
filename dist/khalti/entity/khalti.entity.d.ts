export declare enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    EXPIRED = "expired",
    CANCELED = "canceled"
}
export declare class Khalti {
    id: string;
    pidx: string;
    purchaseOrderId: string;
    amount: number;
    status: PaymentStatus;
    paymentUrl: string;
    subscriptionId: string;
    expiresAt?: Date;
    customerInfo?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
