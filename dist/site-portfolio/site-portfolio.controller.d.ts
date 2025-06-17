/// <reference types="multer" />
import { SitePortfolioService } from './site-portfolio.service';
import { CreateSitePortfolioDto } from './dto/create-site-portfolio.dto';
import { UpdateSitePortfolioDto } from './dto/update-site-portfolio.dto';
export declare class SitePortfolioController {
    private readonly portfolioService;
    constructor(portfolioService: SitePortfolioService);
    create(req: any, createDto: CreateSitePortfolioDto, thumbnail?: Express.Multer.File): Promise<import("./entity/site-portfolio.entity").SitePortfolio>;
    update(id: string, req: any, updateDto: UpdateSitePortfolioDto, thumbnail?: Express.Multer.File): Promise<import("./entity/site-portfolio.entity").SitePortfolio>;
}
