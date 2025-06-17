import { Notification } from './entity/notification.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
export declare class NotificationService {
    private notificationRepo;
    private userRepo;
    constructor(notificationRepo: Repository<Notification>, userRepo: Repository<User>);
    createNotification(recipient: string, title: string, message: string): Promise<Notification>;
    getUserNotifications(userId: string): Promise<Notification[]>;
    markAsRead(notificationId: string): Promise<Notification>;
}
