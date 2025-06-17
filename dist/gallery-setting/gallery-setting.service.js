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
exports.GallerySettingService = void 0;
const common_1 = require("@nestjs/common");
const gallery_setting_entity_1 = require("./entity/gallery-setting.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const upload_service_1 = require("src/upload/upload.service");
const user_entity_1 = require("src/user/entities/user.entity");
const project_entity_1 = require("src/project/entities/project.entity");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
let GallerySettingService = class GallerySettingService {
    constructor(gallerySettingRepository, UserRepository, projectRepository, uploadRepository, uploadService) {
        this.gallerySettingRepository = gallerySettingRepository;
        this.UserRepository = UserRepository;
        this.projectRepository = projectRepository;
        this.uploadRepository = uploadRepository;
        this.uploadService = uploadService;
    }
    async create(createGallerySettingDto, userId, projectCover) {
        const { projectId } = createGallerySettingDto;
        console.log(projectId);
        const [project, user] = await Promise.all([
            this.projectRepository.findOne({
                where: { id: projectId },
                relations: ['gallerySetting'],
            }),
            projectCover
                ? this.UserRepository.findOne({ where: { id: userId } })
                : null,
        ]);
        if (!project)
            throw new Error('Project not found');
        if (projectCover && !user)
            throw new Error('User not found');
        const gallerySetting = this.gallerySettingRepository.create({
            ...createGallerySettingDto,
            project,
        });
        let savedGallerySetting = await this.gallerySettingRepository.save(gallerySetting);
        project.gallerySetting = savedGallerySetting;
        console.log(savedGallerySetting);
        await this.projectRepository.save(project);
        console.log('this is project gallery', project);
        console.log('this is project gallery setting', project.gallerySetting);
        if (projectCover && user) {
            const FolderPath = `${user.username}_${user.id}/project-cover`;
            const response = await this.uploadService.uploadFile(projectCover, FolderPath, userId);
            savedGallerySetting = await this.gallerySettingRepository.save({
                ...savedGallerySetting,
                projectCover: response.response.downloadUrl,
            });
            console.log(response.response.downloadUrl);
        }
        console.log(savedGallerySetting);
        return savedGallerySetting;
    }
    async findOneSettingByProjectId(projectId) {
        const gallerySetting = await this.gallerySettingRepository.findOne({
            where: {
                project: {
                    id: projectId,
                },
            },
            relations: ['project', 'project.user'],
        });
        if (!gallerySetting) {
            throw new common_1.NotFoundException(`Gallery settings not found for project ${projectId}`);
        }
        const formattedResponse = {
            id: gallerySetting.id,
            projectHeader: gallerySetting.projectHeader,
            projectDescription: gallerySetting.projectDescription,
            primaryFonts: gallerySetting.primaryFonts,
            secondaryFonts: gallerySetting.secondaryFonts,
            photoLayout: gallerySetting.photoLayout,
            menuIcon: gallerySetting.menuIcon,
            imageGap: gallerySetting.imageGap,
            colorSchema: gallerySetting.colorSchema,
            projectCover: gallerySetting.projectCover,
            galeryHomePageLayout: gallerySetting.galeryHomePageLayout,
            photographer: {
                name: gallerySetting.project.user.name,
                username: gallerySetting.project.user.username,
            },
        };
        return formattedResponse;
    }
    async updateGallerySetting(projectId, updateGallerySettingDto, projectCover) {
        let [gallerySetting, gallery] = await Promise.all([
            this.gallerySettingRepository.findOne({
                where: {
                    project: { id: projectId },
                },
            }),
            this.gallerySettingRepository.findOne({
                where: {
                    project: { id: projectId },
                },
                relations: ['project', 'project.user'],
            }),
        ]);
        if (!gallerySetting) {
            gallerySetting = this.gallerySettingRepository.create({
                ...updateGallerySettingDto,
                project: { id: projectId },
            });
        }
        else {
            Object.assign(gallerySetting, updateGallerySettingDto);
        }
        if (!gallery) {
            throw new common_1.NotFoundException(`Gallery settings not found for project ${projectId}`);
        }
        if (!gallery.project.user) {
            throw new common_1.NotFoundException(`User not found for project ${projectId}`);
        }
        console.log(gallery.project.user?.username);
        if (projectCover) {
            const coverImg = await this.uploadRepository.findOne({
                where: {
                    downloadUrl: gallery.projectCover,
                },
            });
            if (coverImg) {
                await this.uploadService.deleteFile(coverImg.fileId, gallery.project.user.id);
            }
            const FolderPath = `${gallery.project.user.username}_${gallery.project.user.id}/project-cover`;
            console.log(FolderPath);
            const response = await this.uploadService.uploadFile(projectCover, FolderPath, gallery.project.user.id);
            console.log(response);
            console.log(response.response.downloadUrl);
            gallerySetting.projectCover = response.response.downloadUrl;
        }
        const gallerysett = await this.gallerySettingRepository.save(gallerySetting);
        console.log(gallerysett);
        return gallerysett;
    }
};
GallerySettingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(gallery_setting_entity_1.GallerySetting)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(3, (0, typeorm_1.InjectRepository)(upload_entity_1.Upload)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof upload_service_1.UploadService !== "undefined" && upload_service_1.UploadService) === "function" ? _a : Object])
], GallerySettingService);
exports.GallerySettingService = GallerySettingService;
//# sourceMappingURL=gallery-setting.service.js.map