/// <reference types="multer" />
import { CreateGallerySettingDto } from './dto/create-gallery-setting.dto';
import { GallerySetting } from './entity/gallery-setting.entity';
import { Repository } from 'typeorm';
import { UploadService } from 'src/upload/upload.service';
import { User } from 'src/user/entities/user.entity';
import { Project } from 'src/project/entities/project.entity';
import { UpdateGallerySetting } from './dto/update-gallery-setting.dto';
import { Upload } from 'src/backblaze/entity/upload.entity';
export declare class GallerySettingService {
    private readonly gallerySettingRepository;
    private readonly UserRepository;
    private readonly projectRepository;
    private readonly uploadRepository;
    private readonly uploadService;
    constructor(gallerySettingRepository: Repository<GallerySetting>, UserRepository: Repository<User>, projectRepository: Repository<Project>, uploadRepository: Repository<Upload>, uploadService: UploadService);
    create(createGallerySettingDto: CreateGallerySettingDto, userId: string, projectCover?: Express.Multer.File): Promise<GallerySetting>;
    findOneSettingByProjectId(projectId: string): Promise<{
        id: string;
        projectHeader: string;
        projectDescription: string;
        primaryFonts: import("./entity/gallery-setting.entity").Fonts;
        secondaryFonts: import("./entity/gallery-setting.entity").Fonts;
        photoLayout: import("./entity/gallery-setting.entity").PhotoLayout;
        menuIcon: import("./entity/gallery-setting.entity").MenuIcon;
        imageGap: import("./entity/gallery-setting.entity").ImageGap;
        colorSchema: import("./entity/gallery-setting.entity").ColorSchema;
        projectCover: string;
        galeryHomePageLayout: import("./entity/gallery-setting.entity").GalleryHomePageLayout;
        photographer: {
            name: string;
            username: string;
        };
    }>;
    updateGallerySetting(projectId: string, updateGallerySettingDto: UpdateGallerySetting, projectCover?: Express.Multer.File): Promise<GallerySetting>;
}
