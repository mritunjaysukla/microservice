/// <reference types="multer" />
import { GallerySettingService } from './gallery-setting.service';
import { CreateGallerySettingDto } from './dto/create-gallery-setting.dto';
import { GallerySetting } from './entity/gallery-setting.entity';
import { UpdateGallerySetting } from './dto/update-gallery-setting.dto';
export declare class GallerySettingController {
    private readonly gallerySettingService;
    constructor(gallerySettingService: GallerySettingService);
    create(createGallerySettingDto: CreateGallerySettingDto, projectCover: Express.Multer.File, req: any): Promise<GallerySetting>;
    findOneGallerySeetingByProjectId(projectId: string): Promise<any>;
    updateGallerySetting(projectId: string, updateGallerySettingDto: UpdateGallerySetting, projectCover?: Express.Multer.File): Promise<GallerySetting>;
}
