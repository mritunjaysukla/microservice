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
exports.FavFolderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const fav_folder_service_1 = require("./fav-folder.service");
const auth_decorator_1 = require("src/common/decorator/auth.decorator");
let FavFolderController = class FavFolderController {
    constructor(favFolderService) {
        this.favFolderService = favFolderService;
    }
    async createFav(projectId, folderId, folderName, req) {
        const clientId = req.user.id;
        return this.favFolderService.createFavFolder(clientId, projectId, folderId, folderName);
    }
    async addFilesToFav(favFolderId, fileIds, req) {
        const userId = req.user.id;
        console.log(favFolderId);
        console.log(fileIds);
        console.log(userId);
        return this.favFolderService.addFilesToFavFolder(favFolderId, fileIds, userId);
    }
    async getFavFolders(req) {
        return this.favFolderService.getFavFoldersByUserId(req);
    }
    async getFavById(id) {
        return this.favFolderService.getFavFolderById(id);
    }
    async removeFilesFromFavFolder(favFolderId, fileIds) {
        return this.favFolderService.removeFilesFromFav(favFolderId, fileIds);
    }
};
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Query)('projectId')),
    __param(1, (0, common_1.Query)('folderId')),
    __param(2, (0, common_1.Query)('folderName')),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], FavFolderController.prototype, "createFav", null);
__decorate([
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)(':favFolderId/add-files'),
    __param(0, (0, common_1.Param)('favFolderId')),
    __param(1, (0, common_1.Query)('fileIds')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array, Object]),
    __metadata("design:returntype", Promise)
], FavFolderController.prototype, "addFilesToFav", null);
__decorate([
    (0, common_1.Get)(),
    (0, auth_decorator_1.Auth)(),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FavFolderController.prototype, "getFavFolders", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FavFolderController.prototype, "getFavById", null);
__decorate([
    (0, common_1.Delete)(':favFolderId/remove-files'),
    __param(0, (0, common_1.Query)('favFolderId')),
    __param(1, (0, common_1.Query)('fileIds')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], FavFolderController.prototype, "removeFilesFromFavFolder", null);
FavFolderController = __decorate([
    (0, common_1.Controller)('fav-folder'),
    __metadata("design:paramtypes", [fav_folder_service_1.FavFolderService])
], FavFolderController);
exports.FavFolderController = FavFolderController;
//# sourceMappingURL=fav-folder.controller.js.map