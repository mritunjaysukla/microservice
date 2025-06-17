export declare class BasicSiteSettingResponseDto {
    userId: string;
    username: string;
    name: string;
    email: string;
    phoneNumber: string;
    studioAddress: string;
    avatar: string;
    location: {
        latitude: number;
        longitude: number;
    };
}
export type WatermarkOptions = {
    position: 'full' | 'center' | 'bottom-right' | 'custom';
    opacity: number;
    scale: number;
    customX: number;
    customY: number;
    pattern: 'diagonal' | 'grid' | 'radial' | 'unsplash';
    text: string;
    textColor: string;
    textSize: number;
    textRotation: number;
    spacing: number;
};
export declare class FullSiteSettingResponseDto extends BasicSiteSettingResponseDto {
    socialLinks: {
        facebookLink?: string;
        instagramLink?: string;
        linkedinLink?: string;
        youtubeLink?: string;
    };
    description?: string;
    serviceStarted?: Date;
    totalProject?: number;
    happyClient?: number;
    testimonials: {
        id: string;
        clientName: string;
        clientImage: string;
        projectName: string;
        description: string;
    }[];
    portfolios: {
        id: string;
        projectName: string;
        shootName: string;
        thumbnail: string;
        filesCount: number;
        images: {
            id: string;
            imageUrl: string;
        }[];
    }[];
}
export declare class BrandSettingsResponseDto {
    brandText?: string;
    brandLogo?: string;
    showBrandLogo: boolean;
}
export declare class SocialLinksResponseDto {
    facebookLink?: string;
    instagramLink?: string;
    linkedinLink?: string;
    youtubeLink?: string;
}
export declare class StatsResponseDto {
    description?: string;
    totalProject?: number;
    happyClient?: number;
}
export declare class WaterMarkResponseDto {
    watermark?: WatermarkOptions;
}
export declare class AgreementsResponseDto {
    userAgreement?: string;
    legalAgreement?: string;
    publishUserAgreement: boolean;
    publishLegalAgreement: boolean;
}
