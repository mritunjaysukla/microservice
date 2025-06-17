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
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const storage_service_1 = require("./storage.service");
const Storage_dto_1 = require("./dto/Storage.dto");
const swagger_1 = require("@nestjs/swagger");
let StorageController = class StorageController {
    constructor(storageService) {
        this.storageService = storageService;
    }
    async getReservedStorage(userId) {
        return await this.storageService.getReserverdStorage(userId);
    }
    async getStorage(userId) {
        return await this.storageService.getCurrentStorageUsed(userId);
    }
    async createOrUpdateStorage(StorageDto) {
        const { userId, storageUsed } = StorageDto;
        return await this.storageService.saveStorageUsed(userId, storageUsed);
    }
    async getTotalStorage() {
        return await this.storageService.getTotalStorageUsed();
    }
    async validateStorageAndReserveStorage(userId, totalFileSize) {
        console.log(totalFileSize);
        try {
            return await this.storageService.validateStorageAndReserveStorage(userId, totalFileSize);
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException) {
                throw new common_1.BadRequestException(error.message);
            }
            if (error instanceof common_1.NotFoundException) {
                throw new common_1.NotFoundException(error.message);
            }
            throw error;
        }
    }
    async addStorageLimit(userId, additionalStorage) {
        const updated = await this.storageService.addStorageLimit(userId, additionalStorage);
        return {
            message: 'Storage limit updated successfully',
            data: updated,
        };
    }
};
__decorate([
    (0, common_1.Get)('reserved/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getReservedStorage", null);
__decorate([
    (0, common_1.Get)(':userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getStorage", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Storage_dto_1.StorageDto]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "createOrUpdateStorage", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getTotalStorage", null);
__decorate([
    (0, common_1.Post)('validate/:userId/:totalFileSize'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('totalFileSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "validateStorageAndReserveStorage", null);
__decorate([
    (0, common_1.Patch)(':userId/add-storage/:additionalStorage'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('additionalStorage')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "addStorageLimit", null);
StorageController = __decorate([
    (0, swagger_1.ApiTags)('storage'),
    (0, common_1.Controller)('storage'),
    __metadata("design:paramtypes", [storage_service_1.StorageService])
], StorageController);
exports.StorageController = StorageController;
//# sourceMappingURL=storage.controller.js.map