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
exports.AppLoggerService = void 0;
const common_1 = require("@nestjs/common");
const pino_1 = require("pino");
const async_hooks_1 = require("async_hooks");
const constants_1 = require("src/global/constants");
const config_1 = require("@nestjs/config");
const configuration_1 = require("src/services/app-config/configuration");
let AppLoggerService = class AppLoggerService {
    constructor(asyncStorage, configService) {
        this.asyncStorage = asyncStorage;
        this.configService = configService;
        const logLevel = configService.get('logLevel');
        const appEnv = configService.get('appEnv');
        const loggerConfig = {
            level: logLevel,
        };
        if (appEnv === configuration_1.AppEnv.DEV) {
            loggerConfig.transport = {
                target: 'pino-pretty',
            };
        }
        this.pino = (0, pino_1.pino)(loggerConfig);
    }
    error(message, trace, context) {
        const traceId = this.asyncStorage.getStore()?.get('traceId');
        this.pino.error({ traceId }, this.getMessage(message, context));
        if (trace) {
            this.pino.error(trace);
        }
    }
    log(message, context) {
        const traceId = this.asyncStorage.getStore()?.get('traceId');
        this.pino.info({ traceId }, this.getMessage(message, context));
    }
    warn(message, context) {
        const traceId = this.asyncStorage.getStore()?.get('traceId');
        this.pino.warn({ traceId }, this.getMessage(message, context));
    }
    getMessage(message, context) {
        return context ? `[${context}] ${message}` : message;
    }
};
AppLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.ASYNC_STORAGE)),
    __metadata("design:paramtypes", [async_hooks_1.AsyncLocalStorage,
        config_1.ConfigService])
], AppLoggerService);
exports.AppLoggerService = AppLoggerService;
//# sourceMappingURL=app-logger.service.js.map