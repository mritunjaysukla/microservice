import { KhaltiService } from './khalti.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
export declare class KhaltiController {
    private readonly paymentService;
    constructor(paymentService: KhaltiService);
    initiate(dto: InitiatePaymentDto, req: any): Promise<any>;
    verify(pidx: string): Promise<any>;
}
