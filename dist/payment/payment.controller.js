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
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
const create_payment_dto_1 = require("./dto/create-payment.dto");
const update_payment_dto_1 = require("./dto/update-payment.dto");
const payment_entity_1 = require("./entity/payment.entity");
const swagger_1 = require("@nestjs/swagger");
const auth_decorator_1 = require("src/common/decorator/auth.decorator");
const swagger_2 = require("@nestjs/swagger");
let PaymentController = class PaymentController {
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async getAllPaymentDetails(page, limit) {
        const parsedPage = page ? parseInt(page, 10) : 1;
        const parsedLimit = limit ? parseInt(limit, 10) : 10;
        if (page && (isNaN(parsedPage) || parsedPage <= 0)) {
            throw new Error('Invalid page number');
        }
        if (limit && (isNaN(parsedLimit) || parsedLimit <= 0)) {
            throw new Error('Invalid limit number');
        }
        return await this.paymentService.getAllPaymentDetails(parsedPage, parsedLimit);
    }
    async getPaymentsWithStatus(status, page = 1, limit = 10) {
        return await this.paymentService.getPaymentsWithStatus(status, Number(page), Number(limit));
    }
    async create(createPaymentDto, req) {
        createPaymentDto.user = req.user;
        console.log(req.user?.id);
        console.log(createPaymentDto.user);
        return await this.paymentService.create(createPaymentDto);
    }
    async verifyEsewaPayment(method, body) {
        return await this.paymentService.verifyPayment(method, body.paymentId, body.paymentAmount);
    }
    async findOne(id) {
        return await this.paymentService.findOne(id);
    }
    async updateStatus(paymentId, paymentType, body) {
        const { status, oldSubscriptionId } = body;
        console.log(status, paymentId);
        return await this.paymentService.updatePaymentStatus(paymentId, status, paymentType, oldSubscriptionId);
    }
    async update(id, updatePaymentDto) {
        return await this.paymentService.update(id, updatePaymentDto);
    }
    async remove(id) {
        return await this.paymentService.delete(id);
    }
};
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)(),
    (0, swagger_2.ApiQuery)({
        name: 'page',
        required: false,
    }),
    (0, swagger_2.ApiQuery)({
        name: 'limit',
        required: false,
    }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getAllPaymentDetails", null);
__decorate([
    (0, common_1.Get)('paymentStatus'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "getPaymentsWithStatus", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_payment_dto_1.CreatePaymentDto, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('verify-payment'),
    (0, swagger_2.ApiQuery)({
        name: 'method',
        enum: ['esewa', 'khalti', 'bank'],
        description: 'Payment method',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                paymentId: { type: 'string', description: 'Unique payment identifier' },
                paymentAmount: { type: 'number', description: 'Amount paid' },
            },
            required: ['paymentId', 'paymentAmount'],
        },
    }),
    __param(0, (0, common_1.Query)('method')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "verifyEsewaPayment", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "findOne", null);
__decorate([
    (0, auth_decorator_1.Auth)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiParam)({
        name: 'paymentId',
        description: 'The ID of the payment to update.',
        required: true,
        type: String,
    }),
    (0, swagger_1.ApiBody)({
        description: 'The new status and optional old subscription ID for the payment.',
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    description: 'The new status for the payment.',
                    enum: ['pending', 'approved', 'rejected'],
                },
                oldSubscriptionId: {
                    type: 'string',
                    description: 'The ID of the old subscription (if applicable).',
                },
            },
            required: ['status'],
        },
    }),
    (0, common_1.Patch)('updateStatus/:paymentId/:paymentType'),
    __param(0, (0, common_1.Param)('paymentId')),
    __param(1, (0, common_1.Param)('paymentType')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "updateStatus", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_payment_dto_1.UpdatePaymentDto]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "update", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "remove", null);
PaymentController = __decorate([
    (0, swagger_1.ApiTags)('Payment'),
    (0, common_1.Controller)('payment'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
exports.PaymentController = PaymentController;
//# sourceMappingURL=payment.controller.js.map