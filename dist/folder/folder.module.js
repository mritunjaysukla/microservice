"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var FolderModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const project_entity_1 = require("src/project/entities/project.entity");
const project_module_1 = require("src/project/project.module");
const folder_entity_1 = require("./entity/folder.entity");
const folder_controller_1 = require("./folder.controller");
const folder_service_1 = require("./folder.service");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
const upload_module_1 = require("src/upload/upload.module");
let FolderModule = FolderModule_1 = class FolderModule {
};
FolderModule = FolderModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([folder_entity_1.Folder, upload_entity_1.Upload, project_entity_1.Project]),
            typeorm_1.TypeOrmModule,
            (0, common_1.forwardRef)(() => project_module_1.ProjectsModule),
            upload_module_1.UploadModule,
        ],
        controllers: [folder_controller_1.FolderController],
        providers: [folder_service_1.FolderService],
        exports: [folder_service_1.FolderService, FolderModule_1],
    })
], FolderModule);
exports.FolderModule = FolderModule;
//# sourceMappingURL=folder.module.js.map