import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment, PaymentStatus, PaymentType } from './entity/payment.entity';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    getAllPaymentDetails(page?: string, limit?: string): Promise<{
        data: {
            subscription: {
                user: {
                    id: string;
                    username: string;
                    email: string;
                };
                plan: {
                    id: string;
                    planName: import("../plan/entity/plan.entity").PlanName;
                    package: import("../plan/entity/plan.entity").Package;
                };
            };
            id: string;
            transactionId: string;
            subscriptionId: string;
            verification_id: string;
            amount: number;
            user: import("../user/entities/user.entity").User;
            paymentDate: Date;
            paymentStatus: PaymentStatus;
            paymentMethod: import("./entity/payment.entity").PaymentMethod;
            paymentType: PaymentType;
            storageAmountGB: string;
            createdAt: Date;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPaymentsWithStatus(status: PaymentStatus, page?: number, limit?: number): Promise<{
        data: {
            id: string;
            transactionId: string;
            subscriptionId: string;
            verification_id: string;
            amount: number;
            paymentDate: string;
            paymentStatus: PaymentStatus;
            paymentMethod: import("./entity/payment.entity").PaymentMethod;
            createdAt: string;
            subscription: {
                user: {
                    id: string;
                    username: string;
                    email: string;
                    avatar: string;
                };
                plan: {
                    id: string;
                    planName: import("../plan/entity/plan.entity").PlanName;
                    package: import("../plan/entity/plan.entity").Package;
                };
            };
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    create(createPaymentDto: CreatePaymentDto, req: any): Promise<Payment>;
    verifyEsewaPayment(method: 'esewa' | 'khalti' | 'bank', body: {
        paymentId: string;
        paymentAmount: number;
    }): Promise<{
        transactionId: string;
        paymentStatus: 'paid' | 'unpaid' | 'failed';
    }>;
    findOne(id: string): Promise<Payment>;
    updateStatus(paymentId: string, paymentType: PaymentType, body: {
        status: PaymentStatus;
        oldSubscriptionId?: string;
    }): Promise<{
        id: string;
        transactionId: string;
        subscriptionId: string;
        verification_id: string;
        amount: number;
        paymentDate: string;
        paymentStatus: PaymentStatus;
        paymentMethod: import("./entity/payment.entity").PaymentMethod;
        createdAt: string;
        subscription: {
            user: {
                id: string;
                username: string;
                email: string;
                avatar: string;
            };
            plan: {
                id: string;
                planName: import("../plan/entity/plan.entity").PlanName;
                package: import("../plan/entity/plan.entity").Package;
            };
        };
    }>;
    update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
