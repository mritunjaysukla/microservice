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
exports.ProductOrderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const product_order_service_1 = require("./product-order.service");
const create_product_order_dto_1 = require("./dto/create-product-order.dto");
const auth_decorator_1 = require("../common/decorator/auth.decorator");
let ProductOrderController = class ProductOrderController {
    constructor(productOrderService) {
        this.productOrderService = productOrderService;
    }
    async createOrder(createOrderDto) {
        return this.productOrderService.createOrder(createOrderDto);
    }
    async getOrdersByProductId(productId) {
        return this.productOrderService.getOrdersByProductId(productId);
    }
    async getOrdersByUserId(userId) {
        return this.productOrderService.getOrdersByUserId(userId);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_order_dto_1.CreateProductOrderDto]),
    __metadata("design:returntype", Promise)
], ProductOrderController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('/:productId'),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductOrderController.prototype, "getOrdersByProductId", null);
__decorate([
    (0, common_1.Get)('/:userId'),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductOrderController.prototype, "getOrdersByUserId", null);
ProductOrderController = __decorate([
    (0, swagger_1.ApiTags)('Product Orders'),
    (0, common_1.Controller)('product-orders'),
    __metadata("design:paramtypes", [product_order_service_1.ProductOrderService])
], ProductOrderController);
exports.ProductOrderController = ProductOrderController;
//# sourceMappingURL=product-order.controller.js.map