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
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const create_subscription_dto_1 = require("./dto/create-subscription.dto");
const update_subscription_dto_1 = require("./dto/update-subscription.dto");
const swagger_1 = require("@nestjs/swagger");
const subscription_service_1 = require("./subscription.service");
const auth_decorator_1 = require("src/common/decorator/auth.decorator");
const create_subscription_with_payment_dto_1 = require("./dto/create-subscription-with-payment.dto");
const calculate_plan_upgrade_dto_1 = require("./dto/calculate-plan-upgrade.dto");
const user_entity_1 = require("src/user/entities/user.entity");
const upgrade_plan_dto_1 = require("./dto/upgrade-plan.dto");
const pagination_dto_1 = require("./dto/pagination.dto");
let SubscriptionController = class SubscriptionController {
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    async sendEmail() {
        await this.subscriptionService.sendExpirationEmails();
    }
    async calculatePlanUpgrade(req, calculatePlanUpgradeDto) {
        const userId = req.user.id;
        return this.subscriptionService.calculatePlanUpgrade(userId, calculatePlanUpgradeDto.newPlanId);
    }
    create(createSubscriptionDto) {
        return this.subscriptionService.create(createSubscriptionDto);
    }
    async createSubscriptionWithPayment(createSubscriptionWithPayment, req) {
        const userId = req?.user?.id;
        if (!userId) {
            throw new common_1.BadRequestException('User is not logged in');
        }
        return this.subscriptionService.createSubscriptionWithPayment(createSubscriptionWithPayment, userId);
    }
    async findAll(paginationDto) {
        const { page, limit } = paginationDto;
        return this.subscriptionService.findAll(page, limit);
    }
    findOne(id) {
        return this.subscriptionService.findOne(id);
    }
    update(id, updateSubscriptionDto) {
        return this.subscriptionService.update(id, updateSubscriptionDto);
    }
    remove(id) {
        return this.subscriptionService.delete(id);
    }
    async getActiveAndLatestEndedSubscription(userId) {
        return this.subscriptionService.getActiveAndLatestEndedSubscription(userId);
    }
    async getSubscriptionsByUserId(userId) {
        return this.subscriptionService.getSubscriptionsByUserId(userId);
    }
    async getUserDetailedSubscriptions(userId) {
        return this.subscriptionService.getPhotographerDetailedSubscriptions(userId);
    }
    async upgradePlan(req, upgradePlanDto) {
        const userId = req.user.id;
        return this.subscriptionService.upgradePlan(userId, upgradePlanDto);
    }
};
__decorate([
    (0, common_1.Get)('email'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "sendEmail", null);
__decorate([
    (0, common_1.Post)('calculate-upgrade'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, calculate_plan_upgrade_dto_1.CalculatePlanUpgradeDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "calculatePlanUpgrade", null);
__decorate([
    (0, auth_decorator_1.Auth)(user_entity_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subscription_dto_1.CreateSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    (0, common_1.Post)('create-subscription-with-payment'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subscription_with_payment_dto_1.CreateSubscriptionWithPaymentDto, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "createSubscriptionWithPayment", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "findAll", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "findOne", null);
__decorate([
    (0, auth_decorator_1.Auth)(user_entity_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_subscription_dto_1.UpdateSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "update", null);
__decorate([
    (0, auth_decorator_1.Auth)(user_entity_1.Role.ADMIN),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('details/active-and-latest-ended/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getActiveAndLatestEndedSubscription", null);
__decorate([
    (0, common_1.Get)('/user/:userId'),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getSubscriptionsByUserId", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    (0, common_1.Get)('detailed-subscriptions/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "getUserDetailedSubscriptions", null);
__decorate([
    (0, common_1.Post)('upgrade'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upgrade_plan_dto_1.UpgradePlanDto]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "upgradePlan", null);
SubscriptionController = __decorate([
    (0, swagger_1.ApiTags)('Subscriptions'),
    (0, common_1.Controller)('subscriptions'),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionController);
exports.SubscriptionController = SubscriptionController;
//# sourceMappingURL=subscription.controller.js.map