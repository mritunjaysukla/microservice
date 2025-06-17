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
var AppCacheModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppCacheModule = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const cache_config_service_1 = require("./services/cache-config/cache-config.service");
const config_1 = require("@nestjs/config");
const logger_module_1 = require("../logger/logger.module");
let AppCacheModule = AppCacheModule_1 = class AppCacheModule {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(AppCacheModule_1.name);
    }
    onModuleDestroy() {
        this.logger.log('Disconnecting from cache');
        this.cacheManager.store.getClient().quit(true);
    }
};
AppCacheModule = AppCacheModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [
            logger_module_1.LoggerModule,
            config_1.ConfigModule,
            cache_manager_1.CacheModule.registerAsync({
                imports: [config_1.ConfigModule],
                useClass: cache_config_service_1.CacheConfigService,
                isGlobal: true,
            }),
        ],
        providers: [cache_config_service_1.CacheConfigService],
        exports: [cache_manager_1.CacheModule],
    }),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], AppCacheModule);
exports.AppCacheModule = AppCacheModule;
//# sourceMappingURL=app-cache.module.js.map