import { Product } from '../../products/entity/product.entity';
export declare class ProductOrder {
    id: string;
    additionalNote: string;
    userId: string;
    createdAt: Date;
    product: Product;
    productId: string;
}
