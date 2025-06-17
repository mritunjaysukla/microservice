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
exports.FolderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_folder_dto_1 = require("./dto/create-folder.dto");
const folder_service_1 = require("./folder.service");
const update_folder_dto_1 = require("./dto/update-folder.dto");
const platform_express_1 = require("@nestjs/platform-express");
const auth_decorator_1 = require("src/common/decorator/auth.decorator");
const folder_entity_1 = require("./entity/folder.entity");
const portfolio_folder_dto_1 = require("./dto/portfolio-folder.dto");
let FolderController = class FolderController {
    constructor(folderService) {
        this.folderService = folderService;
    }
    async getAddedFolders(page = 1, limit = 10, req) {
        const userId = req.user?.userId;
        return this.folderService.getAddedFolders(Number(page), Number(limit), userId);
    }
    async downloadFolderZip(folderId, res) {
        try {
            await this.folderService.sendZip(folderId, res);
        }
        catch (error) {
            console.error('Error generating ZIP:', error);
            throw new common_1.HttpException('Failed to generate ZIP archive.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getSelectedFolders(page = 1, limit = 10, req) {
        const userId = req.user?.userId;
        return this.folderService.getSelectedFolders(Number(page), Number(limit), userId);
    }
    async create(createEventDto, coverImg, req) {
        console.log(createEventDto);
        const userId = req.user?.id;
        return await this.folderService.create(createEventDto, userId, coverImg);
    }
    async createPortfolioFolder(createEventDto, req, coverImg) {
        console.log(createEventDto);
        return await this.folderService.createFolderPortfolio(createEventDto, req.user, coverImg);
    }
    async selectFolder(body) {
        const { folderIds } = body;
        return await this.folderService.selectMultipleFolders(folderIds);
    }
    async addFolder(body) {
        const { folderIds } = body;
        return await this.folderService.addMultipleFolders(folderIds);
    }
    async findAll() {
        return await this.folderService.findAllFoldersWithStats();
    }
    async getImagesByFolderId(page = 1, limit = 100, folderId, mimeType) {
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        return await this.folderService.getImagesFromFolderId(pageNumber, limitNumber, folderId, mimeType);
    }
    async getFolderByProjectAndFolderId(folderId) {
        try {
            const folder = await this.folderService.findFolderByFolderAndProjectId(folderId);
            return folder;
        }
        catch (error) {
            throw new common_1.NotFoundException(error.message || 'Folder or Project not found');
        }
    }
    async findFoldersByProjectId(projectId) {
        if (!projectId) {
            throw new common_1.BadRequestException('Project id is required');
        }
        return this.folderService.findFoldersByProjectId(projectId);
    }
    async findOne(id) {
        return await this.folderService.findOne(id);
    }
    async update(id, updateEventDto, req, coverImg) {
        const userId = req.user?.id;
        console.log(userId);
        console.log(updateEventDto);
        return await this.folderService.update(id, updateEventDto, userId, coverImg);
    }
    async updatePortfolioSelection(folderId, fileIds) {
        if (!Array.isArray(fileIds) || fileIds.length === 0) {
            throw new common_1.BadRequestException('fileIds must be a non-empty array');
        }
        try {
            const updatedFiles = await this.folderService.updatePortfolioSelection(folderId, fileIds);
            return {
                message: 'Portfolio files updated successfully',
                data: updatedFiles,
            };
        }
        catch (error) {
            if (error.message.includes('no folder')) {
                throw new common_1.NotFoundException(error.message);
            }
            throw new common_1.BadRequestException(error.message);
        }
    }
    remove(id, req) {
        return this.folderService.remove(id, req.user?.id);
    }
    async updatePortfolioFolder(id, updateEventDto, req, coverImg) {
        const userId = req.user?.id;
        console.log(userId);
        console.log(updateEventDto);
        return await this.folderService.updateFolderPortfolio(id, updateEventDto, userId, coverImg);
    }
};
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('added'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "getAddedFolders", null);
__decorate([
    (0, common_1.Get)('zip/:folderId/download'),
    __param(0, (0, common_1.Param)('folderId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "downloadFolderZip", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('selected'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "getSelectedFolders", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('coverImg')),
    (0, common_1.Post)(),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                coverImg: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
                title: {
                    type: 'string',
                },
                description: {
                    type: 'string',
                },
                folderCategory: {
                    type: 'string',
                    enum: Object.values(folder_entity_1.FolderCategory),
                },
                eventDate: {
                    type: 'string',
                    format: 'date-time',
                },
                location: {
                    type: 'string',
                },
                projectId: {
                    type: 'string',
                },
            },
            required: ['title', 'projectId'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_folder_dto_1.CreateFolderDto, Object, Object]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "create", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('coverImg')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.Post)('portfolioFolder'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [portfolio_folder_dto_1.CreatePortfolioFolderDto, Object, Object]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "createPortfolioFolder", null);
__decorate([
    (0, common_1.Patch)('selected'),
    (0, swagger_1.ApiBody)({
        description: 'Array of folder IDs (UUIDs) to be selected',
        type: Object,
        schema: {
            type: 'object',
            properties: {
                folderIds: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'uuid',
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "selectFolder", null);
__decorate([
    (0, common_1.Patch)('added'),
    (0, swagger_1.ApiBody)({
        description: 'Array of folder IDs (UUIDs) to be selected',
        type: Object,
        schema: {
            type: 'object',
            properties: {
                folderIds: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'uuid',
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "addFolder", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('images/:folderId'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Param)('folderId')),
    __param(3, (0, common_1.Query)('mimeType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "getImagesByFolderId", null);
__decorate([
    (0, common_1.Get)(':folderId/project/:projectId'),
    __param(0, (0, common_1.Param)('folderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "getFolderByProjectAndFolderId", null);
__decorate([
    (0, common_1.Get)('project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "findFoldersByProjectId", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "findOne", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('coverImg')),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                coverImg: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
                title: {
                    type: 'string',
                },
                description: {
                    type: 'string',
                },
                eventDate: {
                    type: 'string',
                    format: 'date-time',
                },
                location: {
                    type: 'string',
                },
                projectId: {
                    type: 'string',
                },
            },
            required: [],
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_folder_dto_1.UpdateFolderDto, Object, Object]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)('portfolioImage/:folderId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update selected portfolio images for a folder' }),
    (0, swagger_1.ApiParam)({
        name: 'folderId',
        type: String,
        description: 'ID of the folder to update',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                fileIds: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['fileId1', 'fileId2'],
                },
            },
            required: ['fileIds'],
        },
    }),
    __param(0, (0, common_1.Param)('folderId')),
    __param(1, (0, common_1.Body)('fileIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "updatePortfolioSelection", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], FolderController.prototype, "remove", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('coverImg')),
    (0, common_1.Patch)('portfolioFolder/:id'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                coverImg: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
                title: {
                    type: 'string',
                },
                description: {
                    type: 'string',
                },
                eventDate: {
                    type: 'string',
                    format: 'date-time',
                },
                location: {
                    type: 'string',
                },
            },
            required: [],
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, portfolio_folder_dto_1.UpdatePortfolioFolderDto, Object, Object]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "updatePortfolioFolder", null);
FolderController = __decorate([
    (0, swagger_1.ApiTags)('folder'),
    (0, common_1.Controller)('folder'),
    __metadata("design:paramtypes", [folder_service_1.FolderService])
], FolderController);
exports.FolderController = FolderController;
//# sourceMappingURL=folder.controller.js.map