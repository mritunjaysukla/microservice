"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmailModule = void 0;
const common_1 = require("@nestjs/common");
const send_email_service_1 = require("./send-email.service");
const mailer_1 = require("@nestjs-modules/mailer");
const sendEmail_1 = require("src/utils/sendEmail");
let SendEmailModule = class SendEmailModule {
};
SendEmailModule = __decorate([
    (0, common_1.Module)({
        imports: [mailer_1.MailerModule],
        providers: [send_email_service_1.SendEmailService, sendEmail_1.MailerService],
        exports: [send_email_service_1.SendEmailService],
    })
], SendEmailModule);
exports.SendEmailModule = SendEmailModule;
//# sourceMappingURL=send-email.module.js.map