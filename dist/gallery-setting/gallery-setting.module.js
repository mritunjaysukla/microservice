"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GallerySettingModule = void 0;
const common_1 = require("@nestjs/common");
const gallery_setting_controller_1 = require("./gallery-setting.controller");
const gallery_setting_service_1 = require("./gallery-setting.service");
const typeorm_1 = require("@nestjs/typeorm");
const gallery_setting_entity_1 = require("./entity/gallery-setting.entity");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
const upload_module_1 = require("src/upload/upload.module");
const user_entity_1 = require("src/user/entities/user.entity");
const project_entity_1 = require("../project/entities/project.entity");
let GallerySettingModule = class GallerySettingModule {
};
GallerySettingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([gallery_setting_entity_1.GallerySetting, upload_entity_1.Upload, user_entity_1.User, project_entity_1.Project]),
            upload_module_1.UploadModule,
        ],
        controllers: [gallery_setting_controller_1.GallerySettingController],
        providers: [gallery_setting_service_1.GallerySettingService],
    })
], GallerySettingModule);
exports.GallerySettingModule = GallerySettingModule;
//# sourceMappingURL=gallery-setting.module.js.map