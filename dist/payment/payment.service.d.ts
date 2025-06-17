import { Repository } from 'typeorm';
import { Payment, PaymentStatus, PaymentType } from './entity/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { User } from 'src/user/entities/user.entity';
import { Plan } from 'src/plan/entity/plan.entity';
import { Invoice } from 'src/invoice/entity/invoice.entity';
import { Subscription } from 'src/subscription/entity/subscription.entity';
import { ConfigService } from '@nestjs/config';
import { SendEmailService } from 'src/send-email/send-email.service';
import { StorageService } from 'src/storage/storage.service';
export declare class PaymentService {
    private readonly paymentRepository;
    private readonly userRepository;
    private readonly planRepository;
    private readonly invoiceRepository;
    private readonly subscriptionRepository;
    private readonly configService;
    private readonly mailerService;
    private readonly storageService;
    private esewaUrl;
    private merchantCode;
    constructor(paymentRepository: Repository<Payment>, userRepository: Repository<User>, planRepository: Repository<Plan>, invoiceRepository: Repository<Invoice>, subscriptionRepository: Repository<Subscription>, configService: ConfigService, mailerService: SendEmailService, storageService: StorageService);
    create(createPaymentDto: CreatePaymentDto): Promise<Payment>;
    findOne(id: string): Promise<Payment>;
    update(id: string, updatePaymentDto: UpdatePaymentDto): Promise<Payment>;
    delete(id: string): Promise<{
        message: string;
    }>;
    getAllPaymentDetails(page?: number, limit?: number): Promise<{
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
    private paymentStrategies;
    verifyPayment(method: string, paymentId: string, paymentAmount: number): Promise<{
        transactionId: string;
        paymentStatus: 'paid' | 'unpaid' | 'failed';
    }>;
    verifyEsewaPayment(paymentId: string, paymentAmount: number): Promise<{
        transactionId: string;
        paymentStatus: 'paid' | 'unpaid' | 'failed';
    }>;
    getPaymentsWithStatus(paymentStatus: PaymentStatus, page?: number, limit?: number): Promise<{
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
    updatePaymentStatus(paymentId: string, status: PaymentStatus, paymentType: PaymentType, oldSubscriptionId?: string): Promise<{
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
}
