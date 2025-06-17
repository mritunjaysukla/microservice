"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentModule = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
const payment_controller_1 = require("./payment.controller");
const typeorm_1 = require("@nestjs/typeorm");
const payment_entity_1 = require("./entity/payment.entity");
const subscription_entity_1 = require("src/subscription/entity/subscription.entity");
const plan_entity_1 = require("src/plan/entity/plan.entity");
const invoice_entity_1 = require("src/invoice/entity/invoice.entity");
const user_entity_1 = require("src/user/entities/user.entity");
const config_1 = require("@nestjs/config");
const send_email_module_1 = require("src/send-email/send-email.module");
const storage_module_1 = require("src/storage/storage.module");
let PaymentModule = class PaymentModule {
};
PaymentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([payment_entity_1.Payment, subscription_entity_1.Subscription, plan_entity_1.Plan, invoice_entity_1.Invoice, user_entity_1.User]),
            config_1.ConfigModule,
            send_email_module_1.SendEmailModule,
            storage_module_1.StorageModule,
        ],
        providers: [payment_service_1.PaymentService],
        controllers: [payment_controller_1.PaymentController],
    })
], PaymentModule);
exports.PaymentModule = PaymentModule;
//# sourceMappingURL=payment.module.js.map