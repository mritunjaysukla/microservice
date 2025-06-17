import { CreateGallerySettingDto } from './create-gallery-setting.dto';
import { Fonts, PhotoLayout, MenuIcon, ImageGap, ColorSchema, GalleryHomePageLayout } from '../entity/gallery-setting.entity';
declare const UpdateGallerySetting_base: import("@nestjs/mapped-types").MappedType<Partial<CreateGallerySettingDto>>;
export declare class UpdateGallerySetting extends UpdateGallerySetting_base {
    projectHeader?: string;
    projectDescription?: string;
    primaryFonts?: Fonts;
    secondaryFonts?: Fonts;
    photoLayout?: PhotoLayout;
    menuIcon?: MenuIcon;
    imageGap?: ImageGap;
    colorSchema?: ColorSchema;
    projectCover?: any;
    galeryHomePageLayout: GalleryHomePageLayout;
}
export {};
