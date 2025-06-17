/// <reference types="multer" />
import { Repository } from 'typeorm';
import { SitePortfolio } from './entity/site-portfolio.entity';
import { SiteSetting } from '../site-setting/entity/site-setting.entity';
import { User } from '../user/entities/user.entity';
import { UploadService } from '../upload/upload.service';
import { CreateSitePortfolioDto } from './dto/create-site-portfolio.dto';
import { UpdateSitePortfolioDto } from './dto/update-site-portfolio.dto';
import { Upload } from 'src/backblaze/entity/upload.entity';
export declare class SitePortfolioService {
    private portfolioRepository;
    private siteSettingRepository;
    private usersRepository;
    private uploadRepository;
    private uploadService;
    constructor(portfolioRepository: Repository<SitePortfolio>, siteSettingRepository: Repository<SiteSetting>, usersRepository: Repository<User>, uploadRepository: Repository<Upload>, uploadService: UploadService);
    create(userId: string, createDto: CreateSitePortfolioDto, file?: Express.Multer.File): Promise<SitePortfolio>;
    update(portfolioId: string, userId: string, updateDto: UpdateSitePortfolioDto, file?: Express.Multer.File): Promise<SitePortfolio>;
}
