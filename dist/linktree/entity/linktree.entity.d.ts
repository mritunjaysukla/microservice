import { User } from '../../user/entities/user.entity';
export declare class Linktree {
    id: string;
    message: string;
    coverImage: string;
    profileImage: string;
    links: {
        platform: string;
        url: string;
    }[];
    user: User;
}
