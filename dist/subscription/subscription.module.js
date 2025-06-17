"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionModule = void 0;
const common_1 = require("@nestjs/common");
const subscription_service_1 = require("./subscription.service");
const subscription_controller_1 = require("./subscription.controller");
const typeorm_1 = require("@nestjs/typeorm");
const subscription_entity_1 = require("./entity/subscription.entity");
const payment_entity_1 = require("src/payment/entity/payment.entity");
const plan_entity_1 = require("src/plan/entity/plan.entity");
const user_entity_1 = require("src/user/entities/user.entity");
const invoice_entity_1 = require("src/invoice/entity/invoice.entity");
const invoice_module_1 = require("src/invoice/invoice.module");
const sendEmail_1 = require("src/utils/sendEmail");
const send_email_module_1 = require("src/send-email/send-email.module");
const userStorage_entity_1 = require("src/storage/entity/userStorage.entity");
let SubscriptionModule = class SubscriptionModule {
};
SubscriptionModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                subscription_entity_1.Subscription,
                payment_entity_1.Payment,
                plan_entity_1.Plan,
                user_entity_1.User,
                invoice_entity_1.Invoice,
                userStorage_entity_1.UserStorage,
            ]),
            invoice_module_1.InvoiceModule,
            send_email_module_1.SendEmailModule,
        ],
        providers: [subscription_service_1.SubscriptionService, sendEmail_1.MailerService],
        controllers: [subscription_controller_1.SubscriptionController],
        exports: [subscription_service_1.SubscriptionService],
    })
], SubscriptionModule);
exports.SubscriptionModule = SubscriptionModule;
//# sourceMappingURL=subscription.module.js.map