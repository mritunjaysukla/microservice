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
exports.Folder = exports.FolderCategory = void 0;
const project_entity_1 = require("../../project/entities/project.entity");
const typeorm_1 = require("typeorm");
var FolderCategory;
(function (FolderCategory) {
    FolderCategory["RAW_FILES"] = "Raw Files";
    FolderCategory["EDITED_PHOTOS"] = "Edited Photos";
    FolderCategory["TO_BE_REVIEWED"] = "To Be Reviewed";
    FolderCategory["APPROVED_PHOTOS"] = "Approved Photos";
    FolderCategory["REVISIONS_REQUESTED"] = "Revisions Requested";
    FolderCategory["BEHIND_THE_SCENES"] = "Behind the Scenes";
    FolderCategory["DOCUMENTS_CONTRACTS"] = "Documents & Contracts";
    FolderCategory["INSPIRATION_MOODBOARD"] = "Inspiration / Moodboard";
    FolderCategory["SOCIAL_MEDIA_VERSIONS"] = "Social Media Versions";
    FolderCategory["HIGHLIGHTS_FEATURED"] = "Highlights / Featured";
})(FolderCategory = exports.FolderCategory || (exports.FolderCategory = {}));
let Folder = class Folder {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Folder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: false }),
    __metadata("design:type", String)
], Folder.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Folder.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FolderCategory,
        default: FolderCategory.RAW_FILES,
    }),
    __metadata("design:type", String)
], Folder.prototype, "folderCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Folder.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Folder.prototype, "eventDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Folder.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], Folder.prototype, "coverImg", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Folder.prototype, "isSelected", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Folder.prototype, "isAdded", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, (project) => project.folders, {
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'projectId' }),
    __metadata("design:type", project_entity_1.Project)
], Folder.prototype, "project", void 0);
Folder = __decorate([
    (0, typeorm_1.Index)('idx_id', ['id']),
    (0, typeorm_1.Entity)()
], Folder);
exports.Folder = Folder;
//# sourceMappingURL=folder.entity.js.map