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
exports.SocialAccountController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const social_account_service_1 = require("./social-account.service");
const create_socialaccount_dto_1 = require("./dto/create-socialaccount.dto");
const update_socialaccount_dto_1 = require("./dto/update-socialaccount.dto");
let SocialAccountController = class SocialAccountController {
    constructor(socialAccountService) {
        this.socialAccountService = socialAccountService;
    }
    create(createSocialAccountDto) {
        return this.socialAccountService.create(createSocialAccountDto);
    }
    findAll() {
        return this.socialAccountService.findAll();
    }
    findOne(id) {
        return this.socialAccountService.findOne(id);
    }
    update(id, updateSocialAccountDto) {
        return this.socialAccountService.update(id, updateSocialAccountDto);
    }
    remove(id) {
        return this.socialAccountService.remove(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_socialaccount_dto_1.CreateSocialAccountDto]),
    __metadata("design:returntype", Promise)
], SocialAccountController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SocialAccountController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocialAccountController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_socialaccount_dto_1.UpdateSocialAccountDto]),
    __metadata("design:returntype", Promise)
], SocialAccountController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SocialAccountController.prototype, "remove", null);
SocialAccountController = __decorate([
    (0, swagger_1.ApiTags)('Social Account'),
    (0, common_1.Controller)('social-accounts'),
    __metadata("design:paramtypes", [social_account_service_1.SocialAccountService])
], SocialAccountController);
exports.SocialAccountController = SocialAccountController;
//# sourceMappingURL=social-account.controller.js.map