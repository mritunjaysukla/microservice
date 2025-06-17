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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePortfolioFolderDto = exports.CreatePortfolioFolderDto = void 0;
const class_validator_1 = require("class-validator");
const folder_entity_1 = require("../entity/folder.entity");
class CreatePortfolioFolderDto {
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePortfolioFolderDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(folder_entity_1.FolderCategory),
    __metadata("design:type", String)
], CreatePortfolioFolderDto.prototype, "folderCategory", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePortfolioFolderDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePortfolioFolderDto.prototype, "coverImg", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", Date)
], CreatePortfolioFolderDto.prototype, "eventDate", void 0);
exports.CreatePortfolioFolderDto = CreatePortfolioFolderDto;
class UpdatePortfolioFolderDto extends CreatePortfolioFolderDto {
}
exports.UpdatePortfolioFolderDto = UpdatePortfolioFolderDto;
//# sourceMappingURL=portfolio-folder.dto.js.map