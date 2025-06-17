"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KhaltiModule = void 0;
const common_1 = require("@nestjs/common");
const khalti_controller_1 = require("./khalti.controller");
const khalti_service_1 = require("./khalti.service");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const khalti_entity_1 = require("./entity/khalti.entity");
const subscription_entity_1 = require("src/subscription/entity/subscription.entity");
let KhaltiModule = class KhaltiModule {
};
KhaltiModule = __decorate([
    (0, common_1.Module)({
        imports: [config_1.ConfigModule, typeorm_1.TypeOrmModule.forFeature([khalti_entity_1.Khalti, subscription_entity_1.Subscription])],
        controllers: [khalti_controller_1.KhaltiController],
        providers: [khalti_service_1.KhaltiService],
    })
], KhaltiModule);
exports.KhaltiModule = KhaltiModule;
//# sourceMappingURL=khalti.module.js.map