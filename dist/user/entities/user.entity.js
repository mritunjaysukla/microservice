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
exports.User = exports.Permission = exports.Status = exports.Role = void 0;
const typeorm_1 = require("typeorm");
const project_entity_1 = require("../../project/entities/project.entity");
const otp_entity_1 = require("../../otp/entity/otp.entity");
const subscription_entity_1 = require("../../subscription/entity/subscription.entity");
const socialAccounts_entity_1 = require("../../socialAccounts/entity/socialAccounts.entity");
const client_interactions_entity_1 = require("../../clientInteraction/entity/client-interactions.entity");
const feedback_entity_1 = require("../../feedback/entity/feedback.entity");
const shared_user_entity_1 = require("../../shared-user/entity/shared-user.entity");
const site_setting_entity_1 = require("../../site-setting/entity/site-setting.entity");
const payment_entity_1 = require("../../payment/entity/payment.entity");
const cards_entity_1 = require("../../cards/entity/cards.entity");
const fav_folder_entity_1 = require("../../fav-folder/entity/fav-folder.entity");
const kyc_user_entity_1 = require("../../kyc-verification/entity/kyc-user.entity");
const user_session_entity_1 = require("./user-session.entity");
const linktree_entity_1 = require("../../linktree/entity/linktree.entity");
const note_entity_1 = require("../../notes/entity/note.entity");
const task_entity_1 = require("../../tasks/entity/task.entity");
const notification_entity_1 = require("../../notification/entity/notification.entity");
var Role;
(function (Role) {
    Role["PHOTOGRAPHER"] = "photographer";
    Role["ADMIN"] = "admin";
    Role["CLIENT"] = "client";
})(Role = exports.Role || (exports.Role = {}));
var Status;
(function (Status) {
    Status["ACTIVE"] = "active";
    Status["INACTIVE"] = "inactive";
})(Status = exports.Status || (exports.Status = {}));
var Permission;
(function (Permission) {
    Permission["READ"] = "read";
    Permission["WRITE"] = "write";
    Permission["DELETE"] = "delete";
})(Permission = exports.Permission || (exports.Permission = {}));
let User = class User {
    generateSubdomain() {
        if (this.username) {
            this.subdomain = this.username.trim().toLowerCase();
        }
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "dateOfBirth", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "subdomain", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, select: false }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true, type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phone_number', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Role,
        default: Role.CLIENT,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, select: false }),
    __metadata("design:type", String)
], User.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 255,
        nullable: true,
        default: null,
        select: false,
    }),
    __metadata("design:type", String)
], User.prototype, "googleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, select: false }),
    __metadata("design:type", String)
], User.prototype, "facebookId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Status,
        default: Status.ACTIVE,
    }),
    __metadata("design:type", String)
], User.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: Permission,
        nullable: true,
    }),
    __metadata("design:type", String)
], User.prototype, "permission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], User.prototype, "isKycVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "is2FaActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isPassKeyActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isSecurityQuestionEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "studioAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "occupation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], User.prototype, "secret", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], User.prototype, "opathUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'credentialId', select: false }),
    __metadata("design:type", String)
], User.prototype, "credentialID", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "credentialPublicKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], User.prototype, "counter", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => project_entity_1.Project, (project) => project.user, { cascade: true }),
    __metadata("design:type", Array)
], User.prototype, "projects", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => otp_entity_1.OTP, (otp) => otp.user, {
        nullable: true,
        cascade: true,
    }),
    __metadata("design:type", otp_entity_1.OTP)
], User.prototype, "otp", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subscription_entity_1.Subscription, (subscription) => subscription.user, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], User.prototype, "subscriptions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => socialAccounts_entity_1.SocialAccount, (socialAccount) => socialAccount.user, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], User.prototype, "socialAccounts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => client_interactions_entity_1.ClientInteraction, (clientInteraction) => clientInteraction.user),
    __metadata("design:type", Array)
], User.prototype, "clientInteractions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => feedback_entity_1.Feedback, (feedback) => feedback.user),
    __metadata("design:type", Array)
], User.prototype, "feedback", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => shared_user_entity_1.SharedUser, (sharedUser) => sharedUser.user, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], User.prototype, "sharedUsers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.Payment, (payment) => payment.user),
    __metadata("design:type", Array)
], User.prototype, "payments", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => site_setting_entity_1.SiteSetting, (siteSetting) => siteSetting.user, {
        nullable: true,
        cascade: true,
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", site_setting_entity_1.SiteSetting)
], User.prototype, "siteSetting", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cards_entity_1.Cards, (cards) => cards.users),
    __metadata("design:type", cards_entity_1.Cards)
], User.prototype, "cards", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => fav_folder_entity_1.FavoriteFolder, (favoriteFolder) => favoriteFolder.user),
    __metadata("design:type", Array)
], User.prototype, "favorites", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => kyc_user_entity_1.Kyc_user, (kyc) => kyc.user),
    __metadata("design:type", kyc_user_entity_1.Kyc_user)
], User.prototype, "kyc", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_session_entity_1.UserSession, (session) => session.user),
    __metadata("design:type", Array)
], User.prototype, "sessions", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => linktree_entity_1.Linktree, (linktree) => linktree.user),
    __metadata("design:type", linktree_entity_1.Linktree)
], User.prototype, "linktree", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => note_entity_1.Note, (notes) => notes.user, { cascade: true }),
    __metadata("design:type", Array)
], User.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_entity_1.Task, (tasks) => tasks.user, { cascade: true }),
    __metadata("design:type", Array)
], User.prototype, "tasks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification.recipient, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], User.prototype, "notifications", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], User.prototype, "generateSubdomain", null);
User = __decorate([
    (0, typeorm_1.Index)('IDX_USER_USERNAME', ['username']),
    (0, typeorm_1.Index)('IDX_USER_EMAIL', ['email']),
    (0, typeorm_1.Index)('IDX_USER_ID', ['id']),
    (0, typeorm_1.Entity)('user')
], User);
exports.User = User;
//# sourceMappingURL=user.entity.js.map