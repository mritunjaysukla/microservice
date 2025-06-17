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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavFolderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fav_folder_entity_1 = require("./entity/fav-folder.entity");
const fav_files_entity_1 = require("./entity/fav-files.entity");
const user_service_1 = require("src/user/services/user/user.service");
const upload_service_1 = require("src/upload/upload.service");
let FavFolderService = class FavFolderService {
    constructor(favFolderRepository, favFileRepository, userService, uploadService) {
        this.favFolderRepository = favFolderRepository;
        this.favFileRepository = favFileRepository;
        this.userService = userService;
        this.uploadService = uploadService;
    }
    async createFavFolder(clientId, projectId, folderId, folderName) {
        const client = await this.userService.getUserById(clientId);
        if (!client) {
            throw new common_1.NotFoundException('Client not found');
        }
        const favFolder = this.favFolderRepository.create({
            project_id: projectId,
            folder_id: folderId,
            user: client,
            folder_name: folderName,
        });
        return await this.favFolderRepository.save(favFolder);
    }
    async addFilesToFavFolder(favFolderId, fileIds, userId) {
        let favFolder = await this.favFolderRepository.findOne({ where: { id: favFolderId } });
        if (!favFolder) {
            if (!fileIds.length) {
                throw new common_1.NotFoundException('No file IDs provided');
            }
            const fileDetails = await this.uploadService.getFilesById(fileIds[0]);
            if (!fileDetails) {
                throw new common_1.NotFoundException('File details not found');
            }
            const { projectId, folderId } = fileDetails;
            if (!projectId || !folderId) {
                throw new common_1.BadRequestException('Invalid project or folder ID');
            }
            favFolder = await this.createFavFolder(userId, projectId, folderId, 'New Folder');
        }
        if (!favFolder) {
            throw new common_1.NotFoundException('Favorite folder not found');
        }
        const favFiles = await Promise.all(fileIds.map(async (fileId) => {
            const favFile = this.favFileRepository.create({
                favFolder: favFolder,
                fileId
            });
            return await this.favFileRepository.save(favFile);
        }));
        return favFiles;
    }
    async getFavFolderById(id) {
        const favFolder = await this.favFolderRepository.findOne({
            where: { id },
            relations: ['files'],
        });
        if (!favFolder) {
            throw new common_1.NotFoundException('Favorite folder not found');
        }
        return favFolder;
    }
    async removeFilesFromFav(favFolderId, fileIds) {
        if (!Array.isArray(fileIds)) {
            fileIds = fileIds.includes(',') ? fileIds.split(',') : [fileIds];
        }
        const favFolder = await this.favFolderRepository.findOne({ where: { id: favFolderId } });
        if (!favFolder) {
            throw new common_1.NotFoundException('Favorite folder not found');
        }
        if (!fileIds.length) {
            throw new common_1.BadRequestException('No file IDs provided for removal');
        }
        console.log('Removing files:', fileIds, 'from folder:', favFolderId);
        const deleteResult = await this.favFileRepository.delete({
            favFolder: { id: favFolderId },
            fileId: (0, typeorm_2.In)(fileIds),
        });
        console.log('Delete result:', deleteResult);
        if (deleteResult.affected === 0) {
            console.warn('No files were deleted. Verify if they exist in the database.');
        }
    }
    async getFavFoldersByUserId(req) {
        const userId = req.user.id;
        console.log(userId);
        const favFolders = await this.favFolderRepository.find({
            where: { user: { id: userId } },
            relations: ['files'],
        });
        return favFolders;
    }
};
FavFolderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fav_folder_entity_1.FavoriteFolder)),
    __param(1, (0, typeorm_1.InjectRepository)(fav_files_entity_1.FavoriteFile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof user_service_1.UserService !== "undefined" && user_service_1.UserService) === "function" ? _a : Object, typeof (_b = typeof upload_service_1.UploadService !== "undefined" && upload_service_1.UploadService) === "function" ? _b : Object])
], FavFolderService);
exports.FavFolderService = FavFolderService;
//# sourceMappingURL=fav-folder.service.js.map