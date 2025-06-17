/// <reference types="multer" />
import { SitePortfolioImages } from '../entity/site-portfolio-images.entity';
import { SitePortfolio } from 'src/site-portfolio/entity/site-portfolio.entity';
export declare class CreatePortfolioImagesDto {
    images: Express.Multer.File[];
}
export interface AddImagesResponse {
    images: SitePortfolioImages[];
    portfolio: SitePortfolio;
}
