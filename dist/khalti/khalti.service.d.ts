import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { Khalti } from './entity/khalti.entity';
import { Subscription } from 'src/subscription/entity/subscription.entity';
export declare class KhaltiService {
    private readonly config;
    private readonly paymentRepo;
    private readonly subscriptionRepo;
    private readonly khaltiUrl;
    private readonly khaltiSecret;
    constructor(config: ConfigService, paymentRepo: Repository<Khalti>, subscriptionRepo: Repository<Subscription>);
    initiate(dto: InitiatePaymentDto): Promise<any>;
    verify(pidx: string): Promise<any>;
}
