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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectSettingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const project_setting_entity_1 = require("./entity/project-setting.entity");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("src/project/entities/project.entity");
const password_service_1 = require("src/user/services/password/password.service");
let ProjectSettingService = class ProjectSettingService {
    constructor(projectSettingRepository, projectRepository, passwordService) {
        this.projectSettingRepository = projectSettingRepository;
        this.projectRepository = projectRepository;
        this.passwordService = passwordService;
    }
    async create(createProjectSettingDto) {
        const { projectId } = createProjectSettingDto;
        console.log(projectId);
        if (!(await this.projectExist(projectId))) {
            throw new common_1.BadRequestException('Project does not exist');
        }
        const projectSetting = this.projectSettingRepository.create(createProjectSettingDto);
        console.log(projectSetting);
        projectSetting.project = { id: projectId };
        return await this.projectSettingRepository.save(projectSetting);
    }
    async projectExist(id) {
        const project = await this.projectRepository.findOne({ where: { id } });
        return !!project;
    }
    async updateByProjectId(projectId, updateProjectSettingDto) {
        if (!(await this.projectExist(projectId))) {
            throw new common_1.BadRequestException('Project does not exist');
        }
        const projectSetting = await this.projectSettingRepository.findOne({
            where: { project: { id: projectId } },
        });
        if (!projectSetting) {
            throw new common_1.BadRequestException('Project setting does not exist');
        }
        const { password, ...rest } = updateProjectSettingDto;
        Object.assign(projectSetting, rest);
        if (password) {
            projectSetting.password = await this.passwordService.generate(password);
            projectSetting.requirePassword = true;
        }
        const updatedProjectSetting = await this.projectSettingRepository.save(projectSetting);
        return updatedProjectSetting;
    }
    async changePwd(settingId, newPwd) {
        const projectSetting = await this.projectSettingRepository.findOne({
            where: { id: settingId },
        });
        if (!projectSetting) {
            throw new common_1.BadRequestException('Project setting does not exist');
        }
        projectSetting.password = await this.passwordService.generate(newPwd);
        projectSetting.requirePassword = true;
        const updatedProjectSetting = await this.projectSettingRepository.save(projectSetting);
        return updatedProjectSetting;
    }
};
ProjectSettingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_setting_entity_1.ProjectSetting)),
    __param(1, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof password_service_1.PasswordService !== "undefined" && password_service_1.PasswordService) === "function" ? _a : Object])
], ProjectSettingService);
exports.ProjectSettingService = ProjectSettingService;
//# sourceMappingURL=project-setting.service.js.map