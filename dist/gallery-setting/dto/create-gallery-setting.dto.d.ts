import { Fonts, PhotoLayout, MenuIcon, ImageGap, ColorSchema, GalleryHomePageLayout } from '../entity/gallery-setting.entity';
export declare class CreateGallerySettingDto {
    projectHeader: string;
    projectDescription: string;
    primaryFonts?: Fonts;
    secondaryFonts?: Fonts;
    photoLayout: PhotoLayout;
    menuIcon: MenuIcon;
    imageGap: ImageGap;
    colorSchema: ColorSchema;
    projectId: string;
    galeryHomePageLayout: GalleryHomePageLayout;
}
