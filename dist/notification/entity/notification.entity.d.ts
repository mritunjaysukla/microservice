import { User } from '../../user/entities/user.entity';
export declare class Notification {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
    recipient: User;
}
