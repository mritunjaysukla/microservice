"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatahubModule = void 0;
const common_1 = require("@nestjs/common");
const datahub_service_1 = require("./datahub.service");
const cache_manager_1 = require("@nestjs/cache-manager");
const config_1 = require("@nestjs/config");
const cache_manager_redis_store_1 = require("cache-manager-redis-store");
let DatahubModule = class DatahubModule {
};
exports.DatahubModule = DatahubModule;
exports.DatahubModule = DatahubModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cache_manager_1.CacheModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    store: cache_manager_redis_store_1.redisStore,
                    host: configService.get('REDIS_HOST'),
                    port: configService.get('REDIS_PORT'),
                    ttl: 24 * 60 * 60,
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        providers: [datahub_service_1.DatahubService],
        exports: [datahub_service_1.DatahubService],
    })
], DatahubModule);
//# sourceMappingURL=datahub.module.js.map