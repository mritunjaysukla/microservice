declare class LinkItem {
    platform: string;
    url: string;
}
export declare class CreateLinktreeDto {
    userId: string;
    message?: string;
    coverImage?: string;
    profileImage?: string;
    links?: LinkItem[];
}
export {};
