import { ProductOrder } from '../../product-order/entity/product-order.entity';
export declare class Product {
    id: string;
    name: string;
    price: number;
    description: string;
    discount: number;
    images: string[];
    fileId: string[];
    userId: string;
    createdAt: Date;
    orders: ProductOrder[];
}
