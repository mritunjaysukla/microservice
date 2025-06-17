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
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const upload_service_1 = require("./upload.service");
const auth_decorator_1 = require("src/common/decorator/auth.decorator");
const datahub_service_1 = require("src/datahub/datahub.service");
const delete_file_dto_1 = require("./dto/delete-file.dto");
const delete_multiple_files_dto_1 = require("./dto/delete-multiple-files.dto");
const create_upload_dto_1 = require("./dto/create-upload.dto");
const change_folder_dto_1 = require("./dto/change-folder.dto");
let UploadController = class UploadController {
    constructor(uploadService, datahubService) {
        this.uploadService = uploadService;
        this.datahubService = datahubService;
    }
    async addUploadResponse(uploadResponse) {
        return this.uploadService.addUploadResponse(uploadResponse);
    }
    async addMultipleUploads(body) {
        return await this.uploadService.addMultipleUploadResponses(body);
    }
    async uploadImage(file, req, projectId, folderId) {
        try {
            if (!file) {
                console.error('No file provided');
                throw new common_1.BadRequestException('No file provided for upload.');
            }
            const result = await this.uploadService.uploadProjecttFile(file, req.user?.id, projectId, folderId);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            console.error('Upload failed:', error);
            throw new common_1.InternalServerErrorException('An internal server error occurred during file upload.');
        }
    }
    async uploadFile(file, req, folderPath) {
        try {
            if (!file) {
                console.error('No file provided');
                throw new common_1.BadRequestException('No file provided for upload.');
            }
            const result = await this.uploadService.uploadFile(file, folderPath, req.user?.id);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            console.error('Upload failed:', error);
            throw new common_1.InternalServerErrorException('An internal server error occurred during file upload.');
        }
    }
    async uploadImages(files, req, projectId, folderId) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('No files provided for upload.');
        }
        const MAX_FILE_SIZE = 100 * 1024 * 1024;
        const ALLOWED_MIME_TYPES = [
            'image/jpeg',
            'image/png',
            'video/mp4',
            'video/webm',
        ];
        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                throw new common_1.BadRequestException(`File ${file.originalname} exceeds the 5MB limit.`);
            }
            if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                throw new common_1.BadRequestException(`Invalid file type for ${file.originalname}. Only JPEG and PNG are allowed.`);
            }
        }
        const userId = req.user?.id;
        try {
            const results = await this.uploadService.UploadMultipleProjectFiles(files, userId, projectId, folderId);
            console.log(results);
            return { success: true, data: results };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('An internal server error occurred during file upload.');
        }
    }
    async deleteFile(deleteFileDto, req) {
        try {
            await this.uploadService.deleteFile(deleteFileDto.fileId, req.user?.id);
            return { message: 'File deleted successfully' };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('An internal server error occurred during file deletion.');
        }
    }
    async deleteMultipleFiles(deleteMultipleFilesDto, req) {
        try {
            await this.uploadService.deleteMultipleFiles(deleteMultipleFilesDto.fileIds, req.user?.id);
            return { message: 'Files deleted successfully' };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('An internal server error occurred during file deletion.');
        }
    }
    async getFilesByFolderId(folderId) {
        try {
            const files = await this.uploadService.getFilesByFolderId(folderId);
            return { files };
        }
        catch (error) {
            throw new common_1.InternalServerErrorException('An internal server error occurred while fetching files.');
        }
    }
    async getBucketObjects() {
        return this.datahubService.deleteBucket();
    }
    async getPresignedUrlForUpload(fileName, contentType) {
        return await this.datahubService.generatePresignedUrlForUpload(fileName, contentType);
    }
    async getMultiplePresignedUrls(body) {
        const { files } = body;
        if (!Array.isArray(files) || files.length === 0) {
            throw new common_1.BadRequestException('Files must be a non-empty array.');
        }
        const sanitizedFiles = files.map((file, index) => {
            if (typeof file.fileName !== 'string' ||
                typeof file.contentType !== 'string' ||
                !file.fileName.trim() ||
                !file.contentType.trim()) {
                throw new common_1.BadRequestException(`Invalid file object at index ${index}: fileName and contentType are required strings.`);
            }
            return {
                fileName: file.fileName.trim(),
                contentType: file.contentType.trim(),
            };
        });
        return this.datahubService.generateMultiplePresignedUrlsForUpload(sanitizedFiles);
    }
    async getFilesByExtension(folderId, extension, page = '1', limit = '10') {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        return this.uploadService.getFilesByExtension(folderId, extension, pageNum, limitNum);
    }
    async getImages(folderId) {
        return await this.uploadService.getImageFiles(folderId);
    }
    async getVideos(folderId) {
        return await this.uploadService.getVideoFiles(folderId);
    }
    async softDeleteMultiple(fileIds) {
        await this.uploadService.softDeleteMultipleUploads(fileIds);
    }
    async recoverMultiple(fileIds) {
        await this.uploadService.recoverMultipleUploads(fileIds);
    }
    async recoverFile(id) {
        await this.uploadService.recoverUpload(id);
    }
    async emptyTrash(userId, fileIds) {
        await this.uploadService.emptyTrashBin(fileIds, userId);
    }
    async getBlurredFile(fileId) {
        return this.uploadService.generateBlurPreview(fileId);
    }
    async changeMultipleFolders(body) {
        return this.uploadService.changeMultipleFolderIds(body);
    }
    async getTrashFiles(projectId, page = '1', limit = '100') {
        return await this.uploadService.getTrashFiles(projectId, Number(page), Number(limit));
    }
    async getPresignedUrl(fileName) {
        const url = await this.datahubService.generateGetPresignedUrl(fileName);
        return { url };
    }
    async addFilesToFolder(id, fileIds) {
        await this.uploadService.addFileToPortfolioFolder(id, fileIds);
        return { message: 'Files added to portfolio folder successfully' };
    }
    async getAllExtensionBYFolderId(folderid) {
        const extensions = await this.uploadService.getExtensionByFolderId(folderid);
        return { extensions };
    }
};
__decorate([
    (0, common_1.Post)('response'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_upload_dto_1.CreateUploadDto]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "addUploadResponse", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/CreateUploadDto' },
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "addMultipleUploads", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(''),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Single file upload',
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
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Query)('folderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadImage", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('singleFile'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Single file upload',
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
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('folderPath')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('multiple'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files')),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        description: 'Multiple files upload',
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('projectId')),
    __param(3, (0, common_1.Query)('folderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object, String, String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadImages", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('delete-file'),
    (0, swagger_1.ApiBody)({ type: delete_file_dto_1.DeleteFileDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [delete_file_dto_1.DeleteFileDto, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "deleteFile", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('delete-multiple-files'),
    (0, swagger_1.ApiBody)({ type: delete_multiple_files_dto_1.DeleteMultipleFilesDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [delete_multiple_files_dto_1.DeleteMultipleFilesDto, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "deleteMultipleFiles", null);
__decorate([
    (0, common_1.Get)('get-files-by-folder-id'),
    __param(0, (0, common_1.Query)('folderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getFilesByFolderId", null);
__decorate([
    (0, common_1.Get)('bucket'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getBucketObjects", null);
__decorate([
    (0, common_1.Get)('presigned-url'),
    __param(0, (0, common_1.Query)('fileName')),
    __param(1, (0, common_1.Query)('contentType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getPresignedUrlForUpload", null);
__decorate([
    (0, common_1.Post)('presigned-urls'),
    (0, swagger_1.ApiBody)({
        description: 'List of files to generate presigned URLs for upload',
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            fileName: { type: 'string', example: 'image.jpg' },
                            contentType: { type: 'string', example: 'image/jpeg' },
                        },
                        required: ['fileName', 'contentType'],
                    },
                },
            },
            required: ['files'],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getMultiplePresignedUrls", null);
__decorate([
    (0, common_1.Get)('by-extension'),
    __param(0, (0, common_1.Query)('folderId')),
    __param(1, (0, common_1.Query)('extension')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getFilesByExtension", null);
__decorate([
    (0, common_1.Get)(':folderId/images'),
    __param(0, (0, common_1.Param)('folderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getImages", null);
__decorate([
    (0, common_1.Get)(':folderId/videos'),
    __param(0, (0, common_1.Param)('folderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getVideos", null);
__decorate([
    (0, common_1.Post)('soft-delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiBody)({
        description: 'Array of file IDs to soft delete',
        schema: {
            type: 'object',
            properties: {
                fileIds: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['file-id-1', 'file-id-2'],
                },
            },
            required: ['fileIds'],
        },
    }),
    __param(0, (0, common_1.Body)('fileIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "softDeleteMultiple", null);
__decorate([
    (0, common_1.Post)('recover-multiple'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiBody)({
        description: 'Array of file IDs to soft delete',
        schema: {
            type: 'object',
            properties: {
                fileIds: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['file-id-1', 'file-id-2'],
                },
            },
            required: ['fileIds'],
        },
    }),
    __param(0, (0, common_1.Body)('fileIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "recoverMultiple", null);
__decorate([
    (0, common_1.Post)('recover/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "recoverFile", null);
__decorate([
    (0, swagger_1.ApiBody)({
        description: 'File IDs to permanently delete from trash',
        schema: {
            type: 'object',
            properties: {
                fileIds: {
                    oneOf: [
                        { type: 'string', example: 'file-id-1' },
                        {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['file-id-1', 'file-id-2'],
                        },
                    ],
                },
            },
            required: ['fileIds'],
        },
    }),
    (0, common_1.Delete)('trash'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Body)('fileIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "emptyTrash", null);
__decorate([
    (0, common_1.Get)('blure/:fileId'),
    __param(0, (0, common_1.Param)('fileId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getBlurredFile", null);
__decorate([
    (0, common_1.Patch)('change-folders'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [change_folder_dto_1.ChangeMultipleFoldersDto]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "changeMultipleFolders", null);
__decorate([
    (0, common_1.Get)('trash/project/:projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getTrashFiles", null);
__decorate([
    (0, common_1.Get)('presigned-url/get/:fileName'),
    __param(0, (0, common_1.Param)('fileName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getPresignedUrl", null);
__decorate([
    (0, common_1.Patch)('portfolioFolder/:id/files'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                fileIds: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['file-id-1', 'file-id-2'],
                },
            },
            required: ['fileIds'],
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('fileIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "addFilesToFolder", null);
__decorate([
    (0, common_1.Get)('allExtension/folder/:folderid'),
    __param(0, (0, common_1.Param)('folderid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getAllExtensionBYFolderId", null);
UploadController = __decorate([
    (0, swagger_1.ApiTags)('Uploads'),
    (0, common_1.Controller)('uploads'),
    __metadata("design:paramtypes", [upload_service_1.UploadService, typeof (_a = typeof datahub_service_1.DatahubService !== "undefined" && datahub_service_1.DatahubService) === "function" ? _a : Object])
], UploadController);
exports.UploadController = UploadController;
//# sourceMappingURL=upload.controller.js.map