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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SitePortfolioImagesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const site_portfolio_images_entity_1 = require("./entity/site-portfolio-images.entity");
const site_portfolio_entity_1 = require("../site-portfolio/entity/site-portfolio.entity");
const upload_service_1 = require("../upload/upload.service");
const user_entity_1 = require("../user/entities/user.entity");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
let SitePortfolioImagesService = class SitePortfolioImagesService {
    constructor(imagesRepository, portfolioRepository, uploadRepository, usersRepository, uploadService) {
        this.imagesRepository = imagesRepository;
        this.portfolioRepository = portfolioRepository;
        this.uploadRepository = uploadRepository;
        this.usersRepository = usersRepository;
        this.uploadService = uploadService;
    }
    async addImages(userId, portfolioId, files) {
        const portfolio = await this.portfolioRepository.findOne({
            where: { id: portfolioId },
        });
        if (!portfolio) {
            throw new common_1.NotFoundException('Portfolio not found');
        }
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            select: ['id', 'username'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const folderPath = `${user.username}_${user.id}/portfolio/${portfolioId}`;
        const uploadedImages = await this.uploadService.uploadMultipleFiles(files, folderPath, userId);
        const portfolioImages = await Promise.all(uploadedImages.map(async (upload) => {
            const image = this.imagesRepository.create({
                imageUrl: upload.downloadUrl,
                portfolio,
            });
            return this.imagesRepository.save(image);
        }));
        portfolio.filesCount = portfolio.filesCount + files.length;
        const updatedPortfolio = await this.portfolioRepository.save(portfolio);
        return {
            images: portfolioImages,
            portfolio: updatedPortfolio,
        };
    }
    async deleteImage(imageId, userId) {
        const image = await this.imagesRepository.findOne({
            where: { id: imageId },
            relations: ['portfolio'],
        });
        if (!image) {
            throw new common_1.NotFoundException('Image not found');
        }
        const upload = await this.uploadRepository.findOne({
            where: { downloadUrl: image.imageUrl },
        });
        if (upload) {
            await this.uploadService.deleteFile(upload.fileId, userId);
        }
        if (image.portfolio) {
            image.portfolio.filesCount = Math.max(0, image.portfolio.filesCount - 1);
            await this.portfolioRepository.save(image.portfolio);
        }
        await this.imagesRepository.remove(image);
    }
};
SitePortfolioImagesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(site_portfolio_images_entity_1.SitePortfolioImages)),
    __param(1, (0, typeorm_1.InjectRepository)(site_portfolio_entity_1.SitePortfolio)),
    __param(2, (0, typeorm_1.InjectRepository)(upload_entity_1.Upload)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        upload_service_1.UploadService])
], SitePortfolioImagesService);
exports.SitePortfolioImagesService = SitePortfolioImagesService;
//# sourceMappingURL=site-portfolio-images.service.js.map