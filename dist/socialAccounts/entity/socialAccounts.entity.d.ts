import { User } from '../../user/entities/user.entity';
export declare enum Social {
    FACEBOOK = "facebook",
    INSTAGRAM = "instagram",
    LINKEDIN = "linkedIn",
    TELEGRAM = "telegram",
    WHATSAPP = "whatsapp",
    YOUTUBE = "youtube",
    TIKTOK = "tiktok"
}
export declare class SocialAccount {
    id: string;
    platformName: Social;
    url: string;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}
