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
exports.ProductOrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_order_entity_1 = require("./entity/product-order.entity");
const product_entity_1 = require("../products/entity/product.entity");
let ProductOrderService = class ProductOrderService {
    constructor(productOrderRepository, productRepository) {
        this.productOrderRepository = productOrderRepository;
        this.productRepository = productRepository;
    }
    async createOrder(createOrderDto) {
        const product = await this.productRepository.findOne({
            where: { id: createOrderDto.productId },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Product with ID ${createOrderDto.productId} not found`);
        }
        const order = this.productOrderRepository.create({
            ...createOrderDto,
            product,
        });
        return this.productOrderRepository.save(order);
    }
    async getOrdersByProductId(productId) {
        const orders = await this.productOrderRepository.find({
            where: { product: { id: productId } },
            relations: ['product'],
        });
        if (!orders.length) {
            throw new common_1.NotFoundException(`No orders found for product ID ${productId}`);
        }
        return orders;
    }
    async getOrdersByUserId(userId) {
        const orders = await this.productOrderRepository.find({
            where: { userId },
            relations: ['product'],
        });
        if (!orders.length) {
            throw new common_1.NotFoundException(`No orders found for user ID ${userId}`);
        }
        return orders;
    }
};
ProductOrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_order_entity_1.ProductOrder)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProductOrderService);
exports.ProductOrderService = ProductOrderService;
//# sourceMappingURL=product-order.service.js.map