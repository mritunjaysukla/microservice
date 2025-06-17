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
exports.HelpCenterController = void 0;
const common_1 = require("@nestjs/common");
const help_center_service_1 = require("./help-center.service");
const create_helpcenter_dto_1 = require("./dto/create-helpcenter.dto");
const help_center_entity_1 = require("./entity/help-center.entity");
const swagger_1 = require("@nestjs/swagger");
let HelpCenterController = class HelpCenterController {
    constructor(helpCenterService) {
        this.helpCenterService = helpCenterService;
    }
    async createHelpCenter(helpCenter) {
        return await this.helpCenterService.createHelpCenter(helpCenter);
    }
    async getHelpCenterByCategory(category) {
        return await this.helpCenterService.getHelpCenterByCategory(category);
    }
    async updateHelpCenter(id, helpCenter) {
        return await this.helpCenterService.updateHelpCenter(id, helpCenter);
    }
    async deleteHelpCenter(id) {
        await this.helpCenterService.deleteHelpCenter(id);
    }
};
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create a new help center entry' }),
    (0, swagger_1.ApiResponse)({
        status: 201,
        description: 'Help center entry created successfully',
        type: help_center_entity_1.HelpCenter,
    }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_helpcenter_dto_1.CreateHelpCenterDto]),
    __metadata("design:returntype", Promise)
], HelpCenterController.prototype, "createHelpCenter", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get help center by category' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Help center entry retrieved successfully',
        type: help_center_entity_1.HelpCenter,
    }),
    (0, common_1.Get)(':category'),
    __param(0, (0, common_1.Param)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HelpCenterController.prototype, "getHelpCenterByCategory", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Update help center entry' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Help center entry updated successfully',
        type: help_center_entity_1.HelpCenter,
    }),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_helpcenter_dto_1.UpdateHelpCenterDto]),
    __metadata("design:returntype", Promise)
], HelpCenterController.prototype, "updateHelpCenter", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], HelpCenterController.prototype, "deleteHelpCenter", null);
HelpCenterController = __decorate([
    (0, common_1.Controller)('help-center'),
    __metadata("design:paramtypes", [help_center_service_1.HelpCenterService])
], HelpCenterController);
exports.HelpCenterController = HelpCenterController;
//# sourceMappingURL=help-center.controller.js.map