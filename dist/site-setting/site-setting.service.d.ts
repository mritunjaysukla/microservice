/// <reference types="multer" />
import { Repository } from 'typeorm';
import { SiteSetting } from './entity/site-setting.entity';
import { UploadService } from '../upload/upload.service';
import { CreateSiteSettingDto } from './dto/create-site-setting.dto';
import { User } from 'src/user/entities/user.entity';
import { AddBrandSettingsDto } from './dto/add-brand-settings.dto';
import { UpdateBrandSettingsDto } from './dto/update-brand-settings.dto';
import { Upload } from 'src/backblaze/entity/upload.entity';
import { AddSocialsDto } from './dto/add-socials.dto';
import { AddPhotographerStatsDto } from './dto/add-photographer-stats.dto';
import { BasicSiteSettingResponseDto, BrandSettingsResponseDto, FullSiteSettingResponseDto, SocialLinksResponseDto, StatsResponseDto, WaterMarkResponseDto } from './dto/site-setting-response.dto';
import { UserAgreementDto } from './dto/user-agreement.dto';
import { LegalAgreementDto } from './dto/legal-agreement.dto';
import { WatermarkOptionsDto } from './dto/update-watermark.dto';
import { DatahubService } from 'src/datahub/datahub.service';
import { PortfolioView } from './entity/portfolio-view.entity';
export declare class SiteSettingService {
    private siteSettingRepository;
    private usersRepository;
    private uploadRepository;
    private uploadService;
    private datahubService;
    private portfolioViewRepository;
    constructor(siteSettingRepository: Repository<SiteSetting>, usersRepository: Repository<User>, uploadRepository: Repository<Upload>, uploadService: UploadService, datahubService: DatahubService, portfolioViewRepository: Repository<PortfolioView>);
    updateWatermark(userId: string, options: WatermarkOptionsDto): Promise<SiteSetting>;
    createSiteSetting(userId: string, createSiteSettingDto: CreateSiteSettingDto): Promise<SiteSetting>;
    addBrandSettings(userId: string, addBrandSettingsDto: AddBrandSettingsDto, file?: Express.Multer.File): Promise<SiteSetting>;
    updateBrandSettings(userId: string, updateBrandSettingsDto: UpdateBrandSettingsDto, file?: Express.Multer.File): Promise<SiteSetting>;
    addSocials(userId: string, addSocialsDto: AddSocialsDto): Promise<SiteSetting>;
    addStats(userId: string, addPhotographerStatsDto: AddPhotographerStatsDto): Promise<SiteSetting>;
    getSiteSettings(userId: string): Promise<BasicSiteSettingResponseDto | FullSiteSettingResponseDto>;
    getSiteSettingsBySubdomain(subdomain: string): Promise<BasicSiteSettingResponseDto | FullSiteSettingResponseDto>;
    getBrandSettings(userId: string): Promise<BrandSettingsResponseDto>;
    getSocialLinks(userId: string): Promise<SocialLinksResponseDto>;
    getStats(userId: string): Promise<StatsResponseDto>;
    getWatermark(userId: string): Promise<WaterMarkResponseDto>;
    updateUserAgreement(userId: string, userAgreementDto: UserAgreementDto): Promise<{
        userAgreement: string;
        publishUserAgreement: boolean;
    }>;
    updateLegalAgreement(userId: string, legalAgreementDto: LegalAgreementDto): Promise<{
        legalAgreement: string;
        publishLegalAgreement: boolean;
    }>;
    getUserAgreement(userId: string): Promise<{
        userAgreement: string;
        publishUserAgreement: boolean;
    }>;
    getLegalAgreement(userId: string): Promise<{
        legalAgreement: string;
        publishLegalAgreement: boolean;
    }>;
    publishUserAgreement(id: string): Promise<SiteSetting>;
    updatePortfolioCoverImg(portfolioCoverImg: Express.Multer.File, user: User): Promise<SiteSetting>;
    recordPortfolioView(siteSettingId: string, ipAddress?: string): Promise<void>;
}
