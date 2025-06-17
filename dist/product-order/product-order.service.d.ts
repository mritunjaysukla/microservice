import { Repository } from 'typeorm';
import { ProductOrder } from './entity/product-order.entity';
import { Product } from '../products/entity/product.entity';
import { CreateProductOrderDto } from './dto/create-product-order.dto';
export declare class ProductOrderService {
    private productOrderRepository;
    private productRepository;
    constructor(productOrderRepository: Repository<ProductOrder>, productRepository: Repository<Product>);
    createOrder(createOrderDto: CreateProductOrderDto): Promise<ProductOrder>;
    getOrdersByProductId(productId: string): Promise<ProductOrder[]>;
    getOrdersByUserId(userId: string): Promise<ProductOrder[]>;
}
