"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalModule = void 0;
const common_1 = require("@nestjs/common");
const async_hooks_1 = require("async_hooks");
const constants_1 = require("./constants");
const mail_service_1 = require("./services/mail/mail.service");
const config_1 = require("@nestjs/config");
let GlobalModule = class GlobalModule {
};
GlobalModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [
            {
                provide: constants_1.ASYNC_STORAGE,
                useValue: new async_hooks_1.AsyncLocalStorage(),
            },
            mail_service_1.MailService,
        ],
        exports: [constants_1.ASYNC_STORAGE, mail_service_1.MailService],
    })
], GlobalModule);
exports.GlobalModule = GlobalModule;
//# sourceMappingURL=global.module.js.map