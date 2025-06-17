"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialAccountModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const social_account_service_1 = require("./social-account.service");
const social_account_controller_1 = require("./social-account.controller");
const socialAccounts_entity_1 = require("./entity/socialAccounts.entity");
let SocialAccountModule = class SocialAccountModule {
};
SocialAccountModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([socialAccounts_entity_1.SocialAccount])],
        providers: [social_account_service_1.SocialAccountService],
        controllers: [social_account_controller_1.SocialAccountController],
    })
], SocialAccountModule);
exports.SocialAccountModule = SocialAccountModule;
//# sourceMappingURL=social-account.module.js.map