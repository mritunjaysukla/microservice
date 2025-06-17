"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteSettingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const site_setting_entity_1 = require("./entity/site-setting.entity");
const upload_service_1 = require("../upload/upload.service");
const user_entity_1 = require("src/user/entities/user.entity");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
const subscription_entity_1 = require("src/subscription/entity/subscription.entity");
const datahub_service_1 = require("src/datahub/datahub.service");
const portfolio_view_entity_1 = require("./entity/portfolio-view.entity");
let SiteSettingService = class SiteSettingService {
    constructor(siteSettingRepository, usersRepository, uploadRepository, uploadService, datahubService, portfolioViewRepository) {
        this.siteSettingRepository = siteSettingRepository;
        this.usersRepository = usersRepository;
        this.uploadRepository = uploadRepository;
        this.uploadService = uploadService;
        this.datahubService = datahubService;
        this.portfolioViewRepository = portfolioViewRepository;
    }
    async updateWatermark(userId, options) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            select: ['id', 'username'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const siteSetting = await this.siteSettingRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site settings not found');
        }
        siteSetting.watermark = options;
        return this.siteSettingRepository.save(siteSetting);
    }
    async createSiteSetting(userId, createSiteSettingDto) {
        const existingSetting = await this.siteSettingRepository.findOne({
            where: { user: { id: userId } },
        });
        if (existingSetting) {
            throw new common_1.BadRequestException('Site settings already exist for this user');
        }
        const siteSetting = this.siteSettingRepository.create({
            ...createSiteSettingDto,
            user: { id: userId },
            publishUserAgreement: createSiteSettingDto.publishUserAgreement || false,
            publishLegalAgreement: createSiteSettingDto.publishLegalAgreement || false,
        });
        return this.siteSettingRepository.save(siteSetting);
    }
    async addBrandSettings(userId, addBrandSettingsDto, file) {
        console.log('This is file: ', file);
        const siteSetting = await this.siteSettingRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site settings not found');
        }
        if (addBrandSettingsDto.brandText) {
            siteSetting.brandText = addBrandSettingsDto.brandText;
        }
        if (file) {
            const user = await this.usersRepository.findOne({
                where: { id: userId },
                select: ['id', 'username'],
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            const folderPath = `${user.username}_${user.id}/brand`;
            console.log(folderPath);
            const uploadResult = await this.uploadService.uploadFile(file, folderPath, userId);
            siteSetting.brandLogo = uploadResult.response.downloadUrl;
        }
        return this.siteSettingRepository.save(siteSetting);
    }
    async updateBrandSettings(userId, updateBrandSettingsDto, file) {
        const siteSetting = await this.siteSettingRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site settings not found');
        }
        if (updateBrandSettingsDto.brandText) {
            siteSetting.brandText = updateBrandSettingsDto.brandText;
        }
        if (file) {
            const user = await this.usersRepository.findOne({
                where: { id: userId },
                select: ['id', 'username'],
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (siteSetting.brandLogo) {
                const oldUpload = await this.uploadRepository.findOne({
                    where: { downloadUrl: siteSetting.brandLogo },
                });
                if (oldUpload) {
                    await this.uploadService.deleteFile(oldUpload.fileId, userId);
                }
            }
            const folderPath = `${user.username}_${user.id}/brand`;
            const uploadResult = await this.uploadService.uploadFile(file, folderPath, userId);
            siteSetting.brandLogo = uploadResult.response.downloadUrl;
        }
        return this.siteSettingRepository.save(siteSetting);
    }
    async addSocials(userId, addSocialsDto) {
        const siteSetting = await this.siteSettingRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site setting not found');
        }
        Object.assign(siteSetting, addSocialsDto);
        return this.siteSettingRepository.save(siteSetting);
    }
    async addStats(userId, addPhotographerStatsDto) {
        const siteSetting = await this.siteSettingRepository.findOne({
            where: {
                user: { id: userId },
            },
        });
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site setting not found');
        }
        Object.assign(siteSetting, addPhotographerStatsDto);
        return this.siteSettingRepository.save(siteSetting);
    }
    async getSiteSettings(userId) {
        const user = await this.usersRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.subscriptions', 'subscriptions')
            .leftJoinAndSelect('subscriptions.plan', 'plan')
            .where('user.id = :userId', { userId })
            .andWhere('subscriptions.status = :status', {
            status: subscription_entity_1.SubscriptionStatus.ACTIVE,
        })
            .getOne();
        console.log('user:', user);
        if (!user || !user.subscriptions || user.subscriptions.length === 0) {
            throw new common_1.NotFoundException('User or active subscription not found');
        }
        const siteSetting = await this.siteSettingRepository
            .createQueryBuilder('site_setting')
            .leftJoinAndSelect('site_setting.user', 'user')
            .leftJoinAndSelect('site_setting.testimonials', 'testimonials')
            .leftJoinAndSelect('site_setting.portfolios', 'portfolios')
            .leftJoinAndSelect('portfolios.images', 'images')
            .where('user.id = :userId', { userId })
            .getOne();
        console.log('sieSetting: ', siteSetting);
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site settings not found');
        }
        if (user.subscriptions[0].plan.isFree) {
            return {
                userId: user.id,
                username: user.username || '',
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                studioAddress: user.studioAddress || '',
                avatar: user.avatar || '',
                location: siteSetting.location || null,
            };
        }
        return {
            userId: user.id,
            username: user.username || '',
            name: user.name || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            studioAddress: user.studioAddress || '',
            avatar: user.avatar || '',
            location: siteSetting.location || null,
            socialLinks: {
                facebookLink: siteSetting.facebookLink || '',
                instagramLink: siteSetting.instagramLink || '',
                linkedinLink: siteSetting.linkedinLink || '',
                youtubeLink: siteSetting.youtubeLink || '',
            },
            description: siteSetting.description || '',
            serviceStarted: siteSetting.serviceStarted || null,
            totalProject: siteSetting.totalProject || 0,
            happyClient: siteSetting.happyClient || 0,
            testimonials: siteSetting.testimonials || [],
            portfolios: siteSetting.portfolios?.map((portfolio) => ({
                ...portfolio,
                images: portfolio.images,
            })) || [],
        };
    }
    async getSiteSettingsBySubdomain(subdomain) {
        const user = await this.usersRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.subscriptions', 'subscriptions')
            .leftJoinAndSelect('subscriptions.plan', 'plan')
            .where('user.subdomain = :subdomain', { subdomain })
            .andWhere('subscriptions.status = :status', {
            status: subscription_entity_1.SubscriptionStatus.ACTIVE,
        })
            .getOne();
        console.log(user);
        if (!user || !user.subscriptions || user.subscriptions.length === 0) {
            throw new common_1.NotFoundException('User or active subscription not found');
        }
        const username = user.username;
        console.log(username);
        const siteSetting = await this.siteSettingRepository
            .createQueryBuilder('site_setting')
            .leftJoinAndSelect('site_setting.user', 'user')
            .leftJoinAndSelect('site_setting.testimonials', 'testimonials')
            .leftJoinAndSelect('site_setting.portfolios', 'portfolios')
            .leftJoinAndSelect('portfolios.images', 'images')
            .where('user.username = :username', { username })
            .getOne();
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site settings not found');
        }
        console.log(siteSetting);
        if (user.subscriptions[0].plan.isFree) {
            return {
                userId: user.id,
                username: user.username || '',
                name: user.name || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                studioAddress: user.studioAddress || '',
                avatar: user.avatar || '',
                location: siteSetting.location || null,
            };
        }
        let avatar = user.avatar || '';
        if (siteSetting.portfolioCoverImg) {
            const fileName = siteSetting.portfolioCoverImg.replace(/^https:\/\/(s3-np1\.datahub\.com\.np\/fotosfolio|cdn\.fotosfolio\.com)\//, '');
            avatar = await this.datahubService.generateGetPresignedUrl(fileName);
        }
        siteSetting.portfolioViewsCount += 1;
        await this.recordPortfolioView(siteSetting.id);
        await this.siteSettingRepository.save(siteSetting);
        return {
            userId: user.id,
            username: user.username || '',
            name: user.name || '',
            email: user.email || '',
            phoneNumber: user.phoneNumber || '',
            studioAddress: user.studioAddress || '',
            avatar: avatar ?? '',
            location: siteSetting.location || null,
            socialLinks: {
                facebookLink: siteSetting.facebookLink || '',
                instagramLink: siteSetting.instagramLink || '',
                linkedinLink: siteSetting.linkedinLink || '',
                youtubeLink: siteSetting.youtubeLink || '',
            },
            description: siteSetting.description || '',
            serviceStarted: siteSetting.serviceStarted || null,
            totalProject: siteSetting.totalProject || 0,
            happyClient: siteSetting.happyClient || 0,
            testimonials: siteSetting.testimonials || [],
            portfolios: siteSetting.portfolios?.map((portfolio) => ({
                ...portfolio,
                images: portfolio.images,
            })) || [],
        };
    }
    async getBrandSettings(userId) {
        const siteSetting = await this.siteSettingRepository
            .createQueryBuilder('siteSetting')
            .leftJoin('siteSetting.user', 'user')
            .where('user.id = :userId', { userId })
            .select([
            'siteSetting.brandText',
            'siteSetting.brandLogo',
            'siteSetting.showBrandLogo',
        ])
            .getOne();
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site settings not found');
        }
        return {
            brandText: siteSetting.brandText || '',
            brandLogo: siteSetting.brandLogo || '',
            showBrandLogo: siteSetting.showBrandLogo || false,
        };
    }
    async getSocialLinks(userId) {
        const siteSetting = await this.siteSettingRepository
            .createQueryBuilder('siteSetting')
            .where('siteSetting.user.id = :userId', { userId })
            .select([
            'siteSetting.facebookLink',
            'siteSetting.instagramLink',
            'siteSetting.linkedinLink',
            'siteSetting.youtubeLink',
        ])
            .getOne();
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site settings not found');
        }
        return {
            facebookLink: siteSetting.facebookLink || '',
            instagramLink: siteSetting.instagramLink || '',
            linkedinLink: siteSetting.linkedinLink || '',
            youtubeLink: siteSetting.youtubeLink || '',
        };
    }
    async getStats(userId) {
        const siteSetting = await this.siteSettingRepository
            .createQueryBuilder('siteSetting')
            .leftJoin('siteSetting.user', 'user')
            .where('user.id = :userId', { userId })
            .select([
            'siteSetting.description',
            'siteSetting.totalProject',
            'siteSetting.happyClient',
        ])
            .getOne();
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site settings not found');
        }
        return {
            description: siteSetting.description || '',
            totalProject: siteSetting.totalProject || 0,
            happyClient: siteSetting.happyClient || 0,
        };
    }
    async getWatermark(userId) {
        const siteSetting = await this.siteSettingRepository
            .createQueryBuilder('siteSetting')
            .leftJoin('siteSetting.user', 'user')
            .where('user.id = :userId', { userId })
            .select(['siteSetting.watermark'])
            .getOne();
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site settings not found');
        }
        return {
            watermark: siteSetting.watermark || '',
        };
    }
    async updateUserAgreement(userId, userAgreementDto) {
        const siteSetting = await this.siteSettingRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site settings not found');
        }
        siteSetting.userAgreement = userAgreementDto.userAgreement;
        siteSetting.publishUserAgreement = userAgreementDto.publishUserAgreement;
        await this.siteSettingRepository.save(siteSetting);
        return {
            userAgreement: siteSetting.userAgreement,
            publishUserAgreement: siteSetting.publishUserAgreement,
        };
    }
    async updateLegalAgreement(userId, legalAgreementDto) {
        const siteSetting = await this.siteSettingRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site settings not found');
        }
        siteSetting.legalAgreement = legalAgreementDto.legalAgreement;
        siteSetting.publishLegalAgreement = legalAgreementDto.publishLegalAgreement;
        await this.siteSettingRepository.save(siteSetting);
        return {
            legalAgreement: siteSetting.legalAgreement,
            publishLegalAgreement: siteSetting.publishLegalAgreement,
        };
    }
    async getUserAgreement(userId) {
        const siteSetting = await this.siteSettingRepository
            .createQueryBuilder('siteSetting')
            .innerJoin('siteSetting.user', 'user')
            .where('user.id = :userId', { userId })
            .select(['siteSetting.userAgreement', 'siteSetting.publishUserAgreement'])
            .getOne();
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site settings not found');
        }
        return {
            userAgreement: siteSetting.userAgreement || '',
            publishUserAgreement: siteSetting.publishUserAgreement || false,
        };
    }
    async getLegalAgreement(userId) {
        const siteSetting = await this.siteSettingRepository
            .createQueryBuilder('siteSetting')
            .innerJoin('siteSetting.user', 'user')
            .where('user.id = :userId', { userId })
            .select([
            'siteSetting.legalAgreement',
            'siteSetting.publishLegalAgreement',
        ])
            .getOne();
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site settings not found');
        }
        return {
            legalAgreement: siteSetting.legalAgreement || '',
            publishLegalAgreement: siteSetting.publishLegalAgreement || false,
        };
    }
    async publishUserAgreement(id) {
        const sitesetting = await this.siteSettingRepository.findOne({
            where: { id },
        });
        if (!sitesetting) {
            throw new common_1.NotFoundException('Site settings not found');
        }
        sitesetting.publishUserAgreement = true;
        return await this.siteSettingRepository.save(sitesetting);
    }
    async updatePortfolioCoverImg(portfolioCoverImg, user) {
        const sitesetting = await this.siteSettingRepository.findOne({
            where: { user: { id: user.id } },
        });
        if (!sitesetting) {
            throw new common_1.NotFoundException('Site settings not found');
        }
        const folder = `$${user.name}_${user.id}/Sitesetting/coverImage`;
        const upload = await this.uploadService.uploadFile(portfolioCoverImg, folder, user.id);
        sitesetting.portfolioCoverImg = upload.response.downloadUrl;
        return await this.siteSettingRepository.save(sitesetting);
    }
    async recordPortfolioView(siteSettingId, ipAddress) {
        const view = this.portfolioViewRepository.create({
            siteSettingId,
            ipAddress,
        });
        await this.portfolioViewRepository.save(view);
        await this.siteSettingRepository
            .createQueryBuilder()
            .update(site_setting_entity_1.SiteSetting)
            .set({ portfolioViewsCount: () => "portfolioViewsCount + 1" })
            .where("id = :id", { id: siteSettingId })
            .execute();
    }
};
SiteSettingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(site_setting_entity_1.SiteSetting)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(upload_entity_1.Upload)),
    __param(5, (0, typeorm_1.InjectRepository)(portfolio_view_entity_1.PortfolioView)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        upload_service_1.UploadService, typeof (_a = typeof datahub_service_1.DatahubService !== "undefined" && datahub_service_1.DatahubService) === "function" ? _a : Object, typeorm_2.Repository])
], SiteSettingService);
exports.SiteSettingService = SiteSettingService;
//# sourceMappingURL=site-setting.service.js.map