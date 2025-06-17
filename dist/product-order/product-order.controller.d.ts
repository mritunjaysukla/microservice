import { ProductOrderService } from './product-order.service';
import { CreateProductOrderDto } from './dto/create-product-order.dto';
export declare class ProductOrderController {
    private readonly productOrderService;
    constructor(productOrderService: ProductOrderService);
    createOrder(createOrderDto: CreateProductOrderDto): Promise<import("./entity/product-order.entity").ProductOrder>;
    getOrdersByProductId(productId: string): Promise<import("./entity/product-order.entity").ProductOrder[]>;
    getOrdersByUserId(userId: string): Promise<import("./entity/product-order.entity").ProductOrder[]>;
}
