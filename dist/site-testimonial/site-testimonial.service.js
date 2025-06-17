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
exports.SiteTestimonialService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const upload_service_1 = require("../upload/upload.service");
const site_testimonial_entity_1 = require("./entity/site-testimonial.entity");
const site_setting_entity_1 = require("src/site-setting/entity/site-setting.entity");
const user_entity_1 = require("src/user/entities/user.entity");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
let SiteTestimonialService = class SiteTestimonialService {
    constructor(testimonialRepository, siteSettingRepository, usersRepository, uploadRepository, uploadService) {
        this.testimonialRepository = testimonialRepository;
        this.siteSettingRepository = siteSettingRepository;
        this.usersRepository = usersRepository;
        this.uploadRepository = uploadRepository;
        this.uploadService = uploadService;
    }
    async create(userId, createDto, file) {
        const siteSetting = await this.siteSettingRepository.findOne({
            where: { user: { id: userId } },
        });
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site settings not found');
        }
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            select: ['id', 'username'],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const folderPath = `${user.username}_${user.id}/testimonials`;
        const uploadResult = await this.uploadService.uploadFile(file, folderPath, userId);
        const testimonial = this.testimonialRepository.create({
            ...createDto,
            clientImage: uploadResult.response.downloadUrl,
            siteSetting,
        });
        return this.testimonialRepository.save(testimonial);
    }
    async update(testimonialId, userId, updateDto, file) {
        const testimonial = await this.testimonialRepository.findOne({
            where: { id: testimonialId },
        });
        if (!testimonial) {
            throw new common_1.NotFoundException('Testimonial not found');
        }
        if (file) {
            const user = await this.usersRepository.findOne({
                where: { id: userId },
                select: ['id', 'username'],
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (testimonial.clientImage) {
                const oldUpload = await this.uploadRepository.findOne({
                    where: { downloadUrl: testimonial.clientImage },
                });
                if (oldUpload) {
                    await this.uploadService.deleteFile(oldUpload.fileId, userId);
                }
            }
            const folderPath = `${user.username}_${user.id}/testimonials`;
            const uploadResult = await this.uploadService.uploadFile(file, folderPath, userId);
            testimonial.clientImage = uploadResult.downloadUrl;
        }
        Object.assign(testimonial, updateDto);
        return this.testimonialRepository.save(testimonial);
    }
    async findOne(id) {
        return this.testimonialRepository.findOne({ where: { id } });
    }
    async findByUserId(userId) {
        const siteSetting = await this.siteSettingRepository.findOne({
            where: { user: { id: userId } },
            relations: ['testimonials'],
        });
        if (!siteSetting) {
            throw new common_1.NotFoundException('Site settings not found');
        }
        return siteSetting.testimonials;
    }
    async selectTestimonialById(id) {
        const testimonial = await this.testimonialRepository.findOne({
            where: { id },
        });
        if (!testimonial) {
            throw new common_1.NotFoundException('Testimonial not found');
        }
        testimonial.isSelected = true;
        return await this.testimonialRepository.save(testimonial);
    }
    async selectMultipleTestimonialsByIds(ids) {
        return await Promise.all(ids.map(async (id) => {
            return await this.selectTestimonialById(id);
        }));
    }
};
SiteTestimonialService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(site_testimonial_entity_1.SiteTestimonial)),
    __param(1, (0, typeorm_1.InjectRepository)(site_setting_entity_1.SiteSetting)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(upload_entity_1.Upload)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        upload_service_1.UploadService])
], SiteTestimonialService);
exports.SiteTestimonialService = SiteTestimonialService;
//# sourceMappingURL=site-testimonial.service.js.map