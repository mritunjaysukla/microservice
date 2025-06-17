/// <reference types="multer" />
import { Repository } from 'typeorm';
import { Product } from './entity/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UploadService } from 'src/upload/upload.service';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProjectSetting } from 'src/project-setting/entity/project-setting.entity';
import { DatahubService } from 'src/datahub/datahub.service';
export declare class ProductService {
    private productRepository;
    private UploadService;
    private readonly settingRepo;
    private readonly datahubService;
    constructor(productRepository: Repository<Product>, UploadService: UploadService, settingRepo: Repository<ProjectSetting>, datahubService: DatahubService);
    create(data: CreateProductDto, files: Express.Multer.File[], req: any): Promise<Product>;
    findAll(page: number, limit: number, userId: string): Promise<{
        items: Product[];
        total: number;
    }>;
    findOne(id: string): Promise<Product>;
    update(id: string, data: UpdateProductDto, files?: Express.Multer.File[], req?: any): Promise<Product>;
    delete(id: string, userId: string): Promise<any>;
    findProductByUser(userId: string, page?: number, pageSize?: number): Promise<{
        items: Product[];
        total: number;
    }>;
}
