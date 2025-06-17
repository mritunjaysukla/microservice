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
exports.WatermarkOptionsDto = void 0;
const class_validator_1 = require("class-validator");
class WatermarkOptionsDto {
}
__decorate([
    (0, class_validator_1.IsIn)(['full', 'center', 'bottom-right', 'custom']),
    __metadata("design:type", String)
], WatermarkOptionsDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WatermarkOptionsDto.prototype, "opacity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WatermarkOptionsDto.prototype, "scale", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WatermarkOptionsDto.prototype, "customX", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WatermarkOptionsDto.prototype, "customY", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['diagonal', 'grid', 'radial', 'unsplash']),
    __metadata("design:type", String)
], WatermarkOptionsDto.prototype, "pattern", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WatermarkOptionsDto.prototype, "text", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], WatermarkOptionsDto.prototype, "textColor", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WatermarkOptionsDto.prototype, "textSize", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WatermarkOptionsDto.prototype, "textRotation", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], WatermarkOptionsDto.prototype, "spacing", void 0);
exports.WatermarkOptionsDto = WatermarkOptionsDto;
//# sourceMappingURL=update-watermark.dto.js.map