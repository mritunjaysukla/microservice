/// <reference types="multer" />
import { SitePortfolioImagesService } from './site-portfolio-images.service';
export declare class SitePortfolioImagesController {
    private readonly imagesService;
    constructor(imagesService: SitePortfolioImagesService);
    addImages(portfolioId: string, req: any, files: Express.Multer.File[]): Promise<import("./dto/create-portfolio-images.dto").AddImagesResponse>;
    deleteImage(id: string, req: any): Promise<{
        message: string;
    }>;
}
