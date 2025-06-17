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
exports.LinktreeController = void 0;
const common_1 = require("@nestjs/common");
const linktree_service_1 = require("./linktree.service");
const create_linktree_dto_1 = require("./dto/create-linktree.dto");
const update_linktree_dto_1 = require("./dto/update-linktree.dto");
let LinktreeController = class LinktreeController {
    constructor(linktreeService) {
        this.linktreeService = linktreeService;
    }
    async create(createDto) {
        return await this.linktreeService.create(createDto);
    }
    async findAll(username) {
        return await this.linktreeService.findByUser(username);
    }
    findOne(id) {
        return this.linktreeService.findOne(id);
    }
    async update(id, updateDto) {
        return await this.linktreeService.update(id, updateDto);
    }
    async remove(id) {
        return await this.linktreeService.remove(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_linktree_dto_1.CreateLinktreeDto]),
    __metadata("design:returntype", Promise)
], LinktreeController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('user/:username'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LinktreeController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], LinktreeController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_linktree_dto_1.UpdateLinktreeDto]),
    __metadata("design:returntype", Promise)
], LinktreeController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LinktreeController.prototype, "remove", null);
LinktreeController = __decorate([
    (0, common_1.Controller)('linktree'),
    __metadata("design:paramtypes", [linktree_service_1.LinktreeService])
], LinktreeController);
exports.LinktreeController = LinktreeController;
//# sourceMappingURL=linktree.controller.js.map