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
exports.ProjectSettingController = void 0;
const common_1 = require("@nestjs/common");
const project_setting_service_1 = require("./project-setting.service");
const create_project_setting_dto_1 = require("./dto/create-project-setting.dto");
const swagger_1 = require("@nestjs/swagger");
const update_project_setting_dto_1 = require("./dto/update-project-setting.dto");
let ProjectSettingController = class ProjectSettingController {
    constructor(projectSettingService) {
        this.projectSettingService = projectSettingService;
    }
    async create(createProjectSettingDto) {
        return this.projectSettingService.create(createProjectSettingDto);
    }
    async updatePasswordByProjectSettingId(newPwd, projectSettingId) {
        return await this.projectSettingService.changePwd(projectSettingId, newPwd);
    }
    async updateByProjectId(projectId, updateProjectSettingDto) {
        return this.projectSettingService.updateByProjectId(projectId, updateProjectSettingDto);
    }
};
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_project_setting_dto_1.CreateProjectSettingDto]),
    __metadata("design:returntype", Promise)
], ProjectSettingController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('pwd/:newPwd/:projectSettingId'),
    __param(0, (0, common_1.Param)('newPwd')),
    __param(1, (0, common_1.Param)('projectSettingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectSettingController.prototype, "updatePasswordByProjectSettingId", null);
__decorate([
    (0, common_1.Patch)(':projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_project_setting_dto_1.UpdateProjectSettingDto]),
    __metadata("design:returntype", Promise)
], ProjectSettingController.prototype, "updateByProjectId", null);
ProjectSettingController = __decorate([
    (0, swagger_1.ApiTags)('Project-setting'),
    (0, common_1.Controller)('project-setting'),
    __metadata("design:paramtypes", [project_setting_service_1.ProjectSettingService])
], ProjectSettingController);
exports.ProjectSettingController = ProjectSettingController;
//# sourceMappingURL=project-setting.controller.js.map