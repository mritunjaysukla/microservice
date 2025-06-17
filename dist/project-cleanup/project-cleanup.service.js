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
var ProjectCleanupService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectCleanupService = void 0;
const common_1 = require("@nestjs/common");
const cron = require("node-cron");
const projects_service_1 = require("src/project/projects.service");
const subscription_service_1 = require("src/subscription/subscription.service");
let ProjectCleanupService = ProjectCleanupService_1 = class ProjectCleanupService {
    constructor(projectService, subscriptionService) {
        this.projectService = projectService;
        this.subscriptionService = subscriptionService;
        this.logger = new common_1.Logger(ProjectCleanupService_1.name);
    }
    onModuleInit() {
        cron.schedule('0 * * * *', async () => {
            this.logger.log('Running daily maintenance cron job');
            try {
                this.logger.log('Archiving expired projects...');
                await this.projectService.archiveProject();
            }
            catch (error) {
                this.logger.error('Archiving expired projects failed:', error);
            }
            try {
                this.logger.log('Sending subscription expiration emails...');
                await this.subscriptionService.sendExpirationEmails();
            }
            catch (error) {
                this.logger.error('Sending subscription expiration emails failed:', error);
            }
            try {
                this.logger.log('Deleting expired projects with deleted flag true...');
                await this.deleteExpiredProjects();
            }
            catch (error) {
                this.logger.error('Deleting expired projects failed:', error);
            }
            try {
                this.logger.log('Deleting expired archived projects with deleted flag true...');
                await this.projectService.deleteExpiredArchivedProjects();
            }
            catch (error) {
                this.logger.error('Deleting expired archived projects failed:', error);
            }
        });
        cron.schedule('0 0 * * 0', async () => {
            this.logger.log('Running weekly maintenance cron job');
            try {
                this.logger.log('Deleting expired projects with deleted flag true...');
                await this.deleteExpiredProjects();
            }
            catch (error) {
                this.logger.error('Deleting expired projects failed:', error);
            }
        });
    }
    async deleteExpiredProjects() {
        await this.projectService.deleteExpiredProjects();
        this.logger.log('Expired projects deleted.');
    }
};
ProjectCleanupService = ProjectCleanupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof projects_service_1.ProjectsService !== "undefined" && projects_service_1.ProjectsService) === "function" ? _a : Object, typeof (_b = typeof subscription_service_1.SubscriptionService !== "undefined" && subscription_service_1.SubscriptionService) === "function" ? _b : Object])
], ProjectCleanupService);
exports.ProjectCleanupService = ProjectCleanupService;
//# sourceMappingURL=project-cleanup.service.js.map