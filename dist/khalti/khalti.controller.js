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
exports.KhaltiController = void 0;
const common_1 = require("@nestjs/common");
const khalti_service_1 = require("./khalti.service");
const initiate_payment_dto_1 = require("./dto/initiate-payment.dto");
const auth_decorator_1 = require("src/common/decorator/auth.decorator");
const swagger_1 = require("@nestjs/swagger");
let KhaltiController = class KhaltiController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async initiate(dto, req) {
        dto.user = req.user;
        return await this.paymentService.initiate(dto);
    }
    async verify(pidx) {
        return await this.paymentService.verify(pidx);
    }
};
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('initiate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [initiate_payment_dto_1.InitiatePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], KhaltiController.prototype, "initiate", null);
__decorate([
    (0, common_1.Get)('verify/:pidx'),
    __param(0, (0, common_1.Param)('pidx')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], KhaltiController.prototype, "verify", null);
KhaltiController = __decorate([
    (0, common_1.Controller)('khalti'),
    __metadata("design:paramtypes", [khalti_service_1.KhaltiService])
], KhaltiController);
exports.KhaltiController = KhaltiController;
//# sourceMappingURL=khalti.controller.js.map