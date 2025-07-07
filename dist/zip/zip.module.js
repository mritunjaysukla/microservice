"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipModule = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const zip_controller_1 = require("./zip.controller");
const enhanced_zip_service_1 = require("./enhanced-zip.service");
const datahub_module_1 = require("./datahub/datahub.module");
let ZipModule = class ZipModule {
};
exports.ZipModule = ZipModule;
exports.ZipModule = ZipModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cache_manager_1.CacheModule.register(),
            (0, common_1.forwardRef)(() => datahub_module_1.DatahubModule),
        ],
        controllers: [zip_controller_1.ZipController],
        providers: [enhanced_zip_service_1.EnhancedZipService],
    })
], ZipModule);
//# sourceMappingURL=zip.module.js.map