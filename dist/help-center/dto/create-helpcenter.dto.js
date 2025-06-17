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
exports.UpdateHelpCenterDto = exports.CreateHelpCenterDto = void 0;
const class_validator_1 = require("class-validator");
const help_center_entity_1 = require("../entity/help-center.entity");
const mapped_types_1 = require("@nestjs/mapped-types");
class CreateHelpCenterDto {
}
__decorate([
    (0, class_validator_1.IsEnum)(help_center_entity_1.HelpCenterSection),
    __metadata("design:type", String)
], CreateHelpCenterDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateHelpCenterDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateHelpCenterDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CreateHelpCenterDto.prototype, "videoUrl", void 0);
exports.CreateHelpCenterDto = CreateHelpCenterDto;
class UpdateHelpCenterDto extends (0, mapped_types_1.PartialType)(CreateHelpCenterDto) {
}
exports.UpdateHelpCenterDto = UpdateHelpCenterDto;
//# sourceMappingURL=create-helpcenter.dto.js.map