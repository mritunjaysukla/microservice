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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProject = exports.ProjectType = exports.StorageType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../user/entities/user.entity");
const folder_entity_1 = require("../../folder/entity/folder.entity");
const feedback_entity_1 = require("../../feedback/entity/feedback.entity");
const project_setting_entity_1 = require("../../project-setting/entity/project-setting.entity");
const gallery_setting_entity_1 = require("../../gallery-setting/entity/gallery-setting.entity");
const shared_user_entity_1 = require("../../shared-user/entity/shared-user.entity");
var StorageType;
(function (StorageType) {
    StorageType["MONTHLY"] = "monthly";
    StorageType["FOREVER"] = "forever";
})(StorageType = exports.StorageType || (exports.StorageType = {}));
var ProjectType;
(function (ProjectType) {
    ProjectType["Wedding"] = "Wedding";
    ProjectType["Engagement"] = "Engagement";
    ProjectType["Portrait"] = "Portrait";
    ProjectType["Family"] = "Family";
    ProjectType["Maternity"] = "Maternity";
    ProjectType["Newborn"] = "Newborn";
    ProjectType["Graduation"] = "Graduation";
    ProjectType["Birthday"] = "Birthday";
    ProjectType["Corporate"] = "Corporate";
    ProjectType["Event"] = "Event";
    ProjectType["Product"] = "Product";
    ProjectType["Fashion"] = "Fashion";
    ProjectType["Travel"] = "Travel";
    ProjectType["Sports"] = "Sports";
    ProjectType["Architecture"] = "Architecture";
    ProjectType["FineArt"] = "Fine Art";
    ProjectType["Personal"] = "Personal";
    ProjectType["Other"] = "Other";
})(ProjectType = exports.ProjectType || (exports.ProjectType = {}));
class BaseProject {
}
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BaseProject.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], BaseProject.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ProjectType, nullable: true }),
    __metadata("design:type", String)
], BaseProject.prototype, "projectType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, nullable: true }),
    __metadata("design:type", Array)
], BaseProject.prototype, "allowedIps", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], BaseProject.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], BaseProject.prototype, "dateCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], BaseProject.prototype, "shootDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: StorageType, default: StorageType.MONTHLY }),
    __metadata("design:type", String)
], BaseProject.prototype, "storageType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], BaseProject.prototype, "deleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], BaseProject.prototype, "timeline", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 0 }),
    __metadata("design:type", Number)
], BaseProject.prototype, "views", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: 0 }),
    __metadata("design:type", Number)
], BaseProject.prototype, "downloads", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], BaseProject.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], BaseProject.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], BaseProject.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], BaseProject.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BaseProject.prototype, "gallerySettingId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], BaseProject.prototype, "projectSettingId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { array: true, nullable: true }),
    __metadata("design:type", Array)
], BaseProject.prototype, "folderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.projects, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", user_entity_1.User)
], BaseProject.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => folder_entity_1.Folder, (event) => event.project, { cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'folderId' }),
    __metadata("design:type", Array)
], BaseProject.prototype, "folders", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => feedback_entity_1.Feedback, (feedback) => feedback.project, { cascade: true }),
    __metadata("design:type", Array)
], BaseProject.prototype, "feedbacks", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => project_setting_entity_1.ProjectSetting, (projectSetting) => projectSetting.project, {
        cascade: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'projectSettingId' }),
    __metadata("design:type", project_setting_entity_1.ProjectSetting)
], BaseProject.prototype, "projectSetting", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => gallery_setting_entity_1.GallerySetting, { nullable: true, cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'gallerySettingId' }),
    __metadata("design:type", gallery_setting_entity_1.GallerySetting)
], BaseProject.prototype, "gallerySetting", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => shared_user_entity_1.SharedUser, (sharedUser) => sharedUser.project, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], BaseProject.prototype, "sharedUsers", void 0);
exports.BaseProject = BaseProject;
//# sourceMappingURL=base-project.entity.js.map