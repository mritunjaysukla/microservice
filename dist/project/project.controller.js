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
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const projects_service_1 = require("./projects.service");
const swagger_1 = require("@nestjs/swagger");
const create_project_with_setting_dto_1 = require("./dto/create-project-with-setting.dto");
const typeorm_1 = require("typeorm");
const update_project_with_setting_dto_1 = require("./dto/update-project-with-setting.dto");
const auth_decorator_1 = require("src/common/decorator/auth.decorator");
const get_project_dto_1 = require("./dto/get-project.dto");
const class_validator_1 = require("class-validator");
const change_timeline_dto_1 = require("./dto/change-timeline.dto");
const platform_express_1 = require("@nestjs/platform-express");
let ProjectsController = class ProjectsController {
    constructor(projectsService, dataSource) {
        this.projectsService = projectsService;
        this.dataSource = dataSource;
    }
    async findAll(page = 1, pageSize = 10) {
        return this.projectsService.findAll(page, pageSize);
    }
    async findAllArchived() {
        await this.projectsService.archiveProject();
        return {
            message: 'Projects archived successfully',
        };
    }
    async comparePwd(pwd, settingId) {
        return await this.projectsService.comparePwd(pwd, settingId);
    }
    async getProjectByUserId(req, query) {
        const userId = req?.user?.id;
        const role = req?.user?.role;
        console.log(userId, role);
        if (!userId || !(0, class_validator_1.isUUID)(userId)) {
            throw new common_1.BadRequestException('Invalid user ID');
        }
        return await this.projectsService.getProjectByUser(userId, query.projectName, query.startDate, query.endDate, query.clientName, query.page, query.limit, role);
    }
    async getProjectById(id) {
        const project = await this.projectsService.getProjectById(id);
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        return project;
    }
    async findOne(id) {
        return this.projectsService.findOne(id);
    }
    async createProjectWithSetting(files = {}, createProjectWithSettingDto, req) {
        console.log('createProjectWithSettingDto', createProjectWithSettingDto);
        const userId = req.user?.id;
        console.log(req.user);
        const projectCoverFile = files.projectCover?.[0];
        const siteCoverFile = files.siteCover?.[0];
        const entityManager = this.dataSource.manager;
        const result = await this.projectsService.createProjectWithSetting(createProjectWithSettingDto, userId, entityManager, projectCoverFile, siteCoverFile);
        return {
            message: 'Project, ProjectSetting and gallerySettings created successfully',
            data: result,
        };
    }
    async restoreArchivedProjects(projects) {
        if (!Array.isArray(projects) || projects.length === 0) {
            throw new common_1.HttpException('You must provide an array of project data to restore.', common_1.HttpStatus.BAD_REQUEST);
        }
        try {
            console.log('Received projects:', projects);
            return await this.projectsService.restoreArchivedProjectsByIds(projects);
        }
        catch (error) {
            console.error('Error restoring projects:', error);
            throw new common_1.HttpException(error.message || 'Failed to restore projects.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getArchivedProjects(userId) {
        try {
            return await this.projectsService.getArchivedProjectsByUserId(userId);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw new common_1.NotFoundException('User not found');
            }
            throw error;
        }
    }
    async incrementViews(projectId) {
        return this.projectsService.incrementView(projectId);
    }
    async incrementDownloads(projectId) {
        return this.projectsService.incrementDownload(projectId);
    }
    async updateProjectSetting(id, changeTimelineDto) {
        return this.projectsService.changeTimeline(id, changeTimelineDto);
    }
    async updateProjectWithSetting(id, updateProjectWithSettingDto, projectCover) {
        return this.projectsService.updateProjectWithSetting(id, updateProjectWithSettingDto, projectCover);
    }
    async deleteExpiredProjects() {
        await this.projectsService.deleteExpiredProjects();
    }
    async remove(id) {
        return this.projectsService.deleteProject(id);
    }
    async getProjectsWithFolders(userId) {
        return this.projectsService.getProjectsWithFolders(userId);
    }
    async uploadCoverImage(projectId, file) {
        const downloadUrl = await this.projectsService.uploadProjectCoverImage(file, projectId);
        return { downloadUrl };
    }
    async uploadSiteCoverImage(projectId, file) {
        const downloadUrl = await this.projectsService.uploadProjectSiteCoverImage(file, projectId);
        return { downloadUrl };
    }
    async deleteExpiredArchivedProjects() {
        console.log('Deleting expired archived projects...');
        await this.projectsService.deleteExpiredArchivedProjects();
    }
};
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('archived'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findAllArchived", null);
__decorate([
    (0, common_1.Get)('pwd'),
    __param(0, (0, common_1.Query)('pwd')),
    __param(1, (0, common_1.Query)('settingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "comparePwd", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    (0, common_1.Get)('users/'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_project_dto_1.GetProjectByUserDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getProjectByUserId", null);
__decorate([
    (0, common_1.Get)(':id/client'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getProjectById", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, auth_decorator_1.Auth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'projectCover', maxCount: 1 },
        { name: 'siteCover', maxCount: 1 },
    ])),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Create a new project with settings and file uploads',
        schema: {
            type: 'object',
            properties: {
                projectCover: {
                    type: 'string',
                    format: 'binary',
                    description: 'Project cover image',
                },
                siteCover: {
                    type: 'string',
                    format: 'binary',
                    description: 'Site cover image',
                },
                title: {
                    type: 'string',
                    description: 'Title of the project',
                },
                description: {
                    type: 'string',
                    description: 'Description of the project',
                },
                dateCompleted: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Completion date of the project',
                },
                shootDate: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Shoot date of the project',
                },
                projectType: {
                    type: 'string',
                    description: 'Type of the project',
                },
                addedProducts: {
                    type: 'array',
                    items: { type: 'string', format: 'uuid' },
                    description: 'List of added products',
                },
                storageType: {
                    type: 'string',
                    description: 'Storage type',
                },
                timeline: {
                    type: 'number',
                    description: 'Timeline for the project',
                },
                photoSelection: {
                    type: 'boolean',
                    description: 'Allow photo selection',
                },
                downloadOriginalPhotos: {
                    type: 'boolean',
                    description: 'Allow downloading original photos',
                },
                watermark: {
                    type: 'boolean',
                    description: 'Apply watermark to photos',
                },
                showProduct: {
                    type: 'boolean',
                    description: 'Display product information',
                },
                allowFeedback: {
                    type: 'boolean',
                    description: 'Allow feedback on photos',
                },
                requireCredentials: {
                    type: 'boolean',
                    description: 'Require credentials for access',
                },
                displayShareBtn: {
                    type: 'boolean',
                    description: 'Display share button',
                },
                displayContactInfo: {
                    type: 'boolean',
                    description: 'Display contact information',
                },
                displayBusinessCard: {
                    type: 'boolean',
                    description: 'Display business card information',
                },
                displayTestimonials: {
                    type: 'boolean',
                    description: 'Display testimonials',
                },
                requirePassword: {
                    type: 'boolean',
                    description: 'Require password for access',
                },
                password: {
                    type: 'string',
                    description: 'Password for restricted access',
                },
                projectHeader: {
                    type: 'string',
                    description: 'Header for the project page',
                },
                projectDescription: {
                    type: 'string',
                    description: 'Description for the project page',
                },
                primaryFonts: {
                    type: 'string',
                    description: 'Primary font for the gallery',
                },
                secondaryFonts: {
                    type: 'string',
                    description: 'Secondary font for the gallery',
                },
                photoLayout: {
                    type: 'string',
                    description: 'Photo layout for the gallery',
                },
                menuIcon: {
                    type: 'string',
                    description: 'Icon to represent the menu',
                },
                imageGap: {
                    type: 'string',
                    description: 'Gap between images in the gallery',
                },
                colorSchema: {
                    type: 'string',
                    description: 'Color schema for the gallery',
                },
                galeryHomePageLayout: {
                    type: 'string',
                    description: 'Layout for the gallery home page',
                },
            },
        },
    }),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_project_with_setting_dto_1.CreateProjectWithSettingDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "createProjectWithSetting", null);
__decorate([
    (0, common_1.Post)('restore'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                projects: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            projectId: { type: 'string', format: 'uuid' },
                            extensionMonth: { type: 'integer' },
                        },
                        example: [
                            {
                                projectId: '4d78b4f7-848b-4b1f-a008-3da0c138619d',
                                extensionMonth: 3,
                            },
                            {
                                projectId: 'aabb77a0-1255-44e2-9f1e-d27235657a0e',
                                extensionMonth: 6,
                            },
                        ],
                    },
                },
            },
            required: ['projects'],
        },
    }),
    __param(0, (0, common_1.Body)('projects')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "restoreArchivedProjects", null);
__decorate([
    (0, common_1.Get)('archived/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getArchivedProjects", null);
__decorate([
    (0, common_1.Patch)('views/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "incrementViews", null);
__decorate([
    (0, common_1.Patch)('downloads/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "incrementDownloads", null);
__decorate([
    (0, common_1.Patch)(':id/change-timeline'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, change_timeline_dto_1.ChangeTimelineDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "updateProjectSetting", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('projectCover')),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_project_with_setting_dto_1.UpdateProjectWithSettingDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "updateProjectWithSetting", null);
__decorate([
    (0, common_1.Delete)('expired'),
    (0, common_1.HttpCode)(204),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "deleteExpiredProjects", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('folder/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "getProjectsWithFolders", null);
__decorate([
    (0, common_1.Post)(':projectId/cover'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "uploadCoverImage", null);
__decorate([
    (0, common_1.Post)('site/:projectId/cover'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "uploadSiteCoverImage", null);
__decorate([
    (0, common_1.Delete)('archive/expired'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "deleteExpiredArchivedProjects", null);
ProjectsController = __decorate([
    (0, swagger_1.ApiTags)('Project'),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService,
        typeorm_1.DataSource])
], ProjectsController);
exports.ProjectsController = ProjectsController;
//# sourceMappingURL=project.controller.js.map