"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notification_entity_1 = require("./entity/notification.entity");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("src/user/entities/user.entity");
let NotificationService = class NotificationService {
    constructor(notificationRepo, userRepo) {
        this.notificationRepo = notificationRepo;
        this.userRepo = userRepo;
    }
    async createNotification(recipient, title, message) {
        const user = await this.userRepo.findOne({ where: { id: recipient } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const notification = this.notificationRepo.create({
            recipient: user,
            title,
            message,
        });
        return await this.notificationRepo.save(notification);
    }
    async getUserNotifications(userId) {
        return this.notificationRepo.find({
            where: { recipient: { id: userId } },
            order: { createdAt: 'DESC' },
            select: ['id', 'title', 'message', 'isRead', 'createdAt'],
        });
    }
    async markAsRead(notificationId) {
        const notification = await this.notificationRepo.findOne({
            where: { id: notificationId },
        });
        if (!notification)
            throw new common_1.NotFoundException('Notification not found');
        notification.isRead = true;
        return await this.notificationRepo.save(notification);
    }
};
NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationService);
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map