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
exports.SharedUserController = void 0;
const common_1 = require("@nestjs/common");
const shared_user_service_1 = require("./shared-user.service");
const swagger_1 = require("@nestjs/swagger");
let SharedUserController = class SharedUserController {
    constructor(sharedUserService) {
        this.sharedUserService = sharedUserService;
    }
    async getClients(photographerId) {
        return this.sharedUserService.getClients(photographerId);
    }
    async getSharedUsersByProjectId(projectId) {
        return this.sharedUserService.getSharedUsersByProjectId(projectId);
    }
};
__decorate([
    (0, common_1.Get)('clients/:photographerId'),
    __param(0, (0, common_1.Param)('photographerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SharedUserController.prototype, "getClients", null);
__decorate([
    (0, common_1.Get)(':projectId'),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SharedUserController.prototype, "getSharedUsersByProjectId", null);
SharedUserController = __decorate([
    (0, swagger_1.ApiTags)('SharedUser'),
    (0, common_1.Controller)('shared-user'),
    __metadata("design:paramtypes", [shared_user_service_1.SharedUserService])
], SharedUserController);
exports.SharedUserController = SharedUserController;
//# sourceMappingURL=shared-user.controller.js.map