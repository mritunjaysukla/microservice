/// <reference types="multer" />
import { SiteSettingService } from './site-setting.service';
import { CreateSiteSettingDto } from './dto/create-site-setting.dto';
import { AddBrandSettingsDto } from './dto/add-brand-settings.dto';
import { UpdateBrandSettingsDto } from './dto/update-brand-settings.dto';
import { AddSocialsDto } from './dto/add-socials.dto';
import { AddPhotographerStatsDto } from './dto/add-photographer-stats.dto';
import { UserAgreementDto } from './dto/user-agreement.dto';
import { LegalAgreementDto } from './dto/legal-agreement.dto';
import { WatermarkOptionsDto } from './dto/update-watermark.dto';
export declare class SiteSettingController {
    private readonly siteSettingService;
    constructor(siteSettingService: SiteSettingService);
    addBrandSettings(req: any, addBrandSettingsDto: AddBrandSettingsDto, brandLogo?: Express.Multer.File): Promise<import("./entity/site-setting.entity").SiteSetting>;
    updateBrandSettings(req: any, updateBrandSettingsDto: UpdateBrandSettingsDto, brandLogo?: Express.Multer.File): Promise<import("./entity/site-setting.entity").SiteSetting>;
    addSocials(req: any, addSocialsDto: AddSocialsDto): Promise<import("./entity/site-setting.entity").SiteSetting>;
    updateLegalAgreement(req: any, legalAgreementDto: LegalAgreementDto): Promise<{
        legalAgreement: string;
        publishLegalAgreement: boolean;
    }>;
    updateUserAgreement(req: any, userAgreementDto: UserAgreementDto): Promise<{
        userAgreement: string;
        publishUserAgreement: boolean;
    }>;
    addStats(req: any, addPhotographerStatsDto: AddPhotographerStatsDto): Promise<import("./entity/site-setting.entity").SiteSetting>;
    updateWatermark(userId: string, options: WatermarkOptionsDto): Promise<import("./entity/site-setting.entity").SiteSetting>;
    createSiteSetting(userId: string, createSiteSettingDto: CreateSiteSettingDto): Promise<import("./entity/site-setting.entity").SiteSetting>;
    getSiteSettings(req: any): Promise<import("./dto/site-setting-response.dto").BasicSiteSettingResponseDto | import("./dto/site-setting-response.dto").FullSiteSettingResponseDto>;
    getSiteSettingsBySubdomain(subdomain: string): Promise<import("./dto/site-setting-response.dto").BasicSiteSettingResponseDto | import("./dto/site-setting-response.dto").FullSiteSettingResponseDto>;
    getBrandSettings(req: any): Promise<import("./dto/site-setting-response.dto").BrandSettingsResponseDto>;
    getSocialLinks(req: any): Promise<import("./dto/site-setting-response.dto").SocialLinksResponseDto>;
    getStats(req: any): Promise<import("./dto/site-setting-response.dto").StatsResponseDto>;
    getWatermark(req: any): Promise<import("./dto/site-setting-response.dto").WaterMarkResponseDto>;
    getUserAgreement(req: any): Promise<{
        userAgreement: string;
        publishUserAgreement: boolean;
    }>;
    getLegalAgreement(req: any): Promise<{
        legalAgreement: string;
        publishLegalAgreement: boolean;
    }>;
    publishUserAgreement(id: string): Promise<import("./entity/site-setting.entity").SiteSetting>;
    updatePortfolioCoverImage(portfolioCoverImg: Express.Multer.File, req: any): Promise<import("./entity/site-setting.entity").SiteSetting>;
}
