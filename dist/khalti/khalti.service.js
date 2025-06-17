"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KhaltiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const axios_1 = require("axios");
const khalti_entity_1 = require("./entity/khalti.entity");
const subscription_entity_1 = require("src/subscription/entity/subscription.entity");
let KhaltiService = class KhaltiService {
    constructor(config, paymentRepo, subscriptionRepo) {
        this.config = config;
        this.paymentRepo = paymentRepo;
        this.subscriptionRepo = subscriptionRepo;
        this.khaltiUrl = this.config.get('KHALTI_API_URL') ?? '';
        this.khaltiSecret = this.config.get('KHALTI_SECRET_KEY') ?? '';
    }
    async initiate(dto) {
        try {
            const { data } = await axios_1.default.post(this.khaltiUrl, dto, {
                headers: {
                    Authorization: `Key ${this.khaltiSecret}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(data);
            console.log('saving to db');
            try {
                const payment = this.paymentRepo.create({
                    pidx: data.pidx,
                    purchaseOrderId: dto.purchase_order_id,
                    amount: dto.amount,
                    status: khalti_entity_1.PaymentStatus.PENDING,
                    paymentUrl: data.payment_url,
                    subscriptionId: dto.subscriptionId,
                    customerInfo: dto.customer_info,
                    expiresAt: new Date(data.expires_at),
                });
                await this.paymentRepo.save(payment);
                console.log('Payment saved:', payment);
            }
            catch (error) {
                console.error('Error saving payment:', error);
                throw new common_1.InternalServerErrorException('Failed to save payment');
            }
            console.log('payment saved');
            return data;
        }
        catch (err) {
            throw new common_1.HttpException(err.response?.data || 'Payment initiation failed', err.response?.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async verify(pidx) {
        const VERIFY_URL = 'https://dev.khalti.com/api/v2/epayment/lookup/';
        try {
            const { data } = await axios_1.default.post(VERIFY_URL, { pidx }, { headers: { Authorization: `Key ${this.khaltiSecret}` } });
            return data;
        }
        catch (err) {
            throw new common_1.HttpException(err.response?.data || 'Verification failed', err.response?.status || common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
KhaltiService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(khalti_entity_1.Khalti)),
    __param(2, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], KhaltiService);
exports.KhaltiService = KhaltiService;
//# sourceMappingURL=khalti.service.js.map