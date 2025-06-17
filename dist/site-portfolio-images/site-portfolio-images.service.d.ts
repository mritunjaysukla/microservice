/// <reference types="multer" />
import { Repository } from 'typeorm';
import { SitePortfolioImages } from './entity/site-portfolio-images.entity';
import { SitePortfolio } from '../site-portfolio/entity/site-portfolio.entity';
import { UploadService } from '../upload/upload.service';
import { User } from '../user/entities/user.entity';
import { AddImagesResponse } from './dto/create-portfolio-images.dto';
import { Upload } from 'src/backblaze/entity/upload.entity';
export declare class SitePortfolioImagesService {
    private imagesRepository;
    private portfolioRepository;
    private uploadRepository;
    private usersRepository;
    private uploadService;
    constructor(imagesRepository: Repository<SitePortfolioImages>, portfolioRepository: Repository<SitePortfolio>, uploadRepository: Repository<Upload>, usersRepository: Repository<User>, uploadService: UploadService);
    addImages(userId: string, portfolioId: string, files: Express.Multer.File[]): Promise<AddImagesResponse>;
    deleteImage(imageId: string, userId: string): Promise<void>;
}
