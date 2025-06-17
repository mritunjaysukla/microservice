import { NotificationService } from './notification.service';
export declare class NotificationController {
    private readonly notificationService;
    constructor(notificationService: NotificationService);
    getMyNotifications(req: any): Promise<import("./entity/notification.entity").Notification[]>;
    markAsRead(id: string): Promise<import("./entity/notification.entity").Notification>;
}
