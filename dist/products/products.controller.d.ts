/// <reference types="multer" />
import { ProductService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly ProductService;
    constructor(ProductService: ProductService);
    create(data: CreateProductDto, files: Express.Multer.File[], req: any): Promise<import("./entity/product.entity").Product>;
    findAll(page: number, limit: number, userId: string): Promise<{
        items: import("./entity/product.entity").Product[];
        total: number;
    }>;
    findOne(id: string): Promise<import("./entity/product.entity").Product>;
    findOneByUser(id: string, page?: number, pageSize?: number): Promise<{
        items: import("./entity/product.entity").Product[];
        total: number;
    }>;
    update(id: string, data: UpdateProductDto, files: Express.Multer.File[], req: any): Promise<import("./entity/product.entity").Product>;
    delete(id: string, req: any): Promise<any>;
}
