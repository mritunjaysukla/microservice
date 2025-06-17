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
exports.AsyncStorageMiddleware = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const constants_1 = require("../../constants");
const async_hooks_1 = require("async_hooks");
let AsyncStorageMiddleware = class AsyncStorageMiddleware {
    constructor(asyncStorage) {
        this.asyncStorage = asyncStorage;
    }
    use(req, res, next) {
        const traceId = req.headers['x-request-id'] || (0, node_crypto_1.randomUUID)();
        const store = new Map().set('traceId', traceId);
        this.asyncStorage.run(store, () => {
            next();
        });
    }
};
AsyncStorageMiddleware = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.ASYNC_STORAGE)),
    __metadata("design:paramtypes", [async_hooks_1.AsyncLocalStorage])
], AsyncStorageMiddleware);
exports.AsyncStorageMiddleware = AsyncStorageMiddleware;
//# sourceMappingURL=async-storage.middleware.js.map