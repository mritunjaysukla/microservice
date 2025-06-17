"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const project_entity_1 = require("./entities/project.entity");
const project_controller_1 = require("./project.controller");
const projects_service_1 = require("./projects.service");
const user_entity_1 = require("src/user/entities/user.entity");
const shared_user_module_1 = require("src/shared-user/shared-user.module");
const shared_user_entity_1 = require("src/shared-user/entity/shared-user.entity");
const user_module_1 = require("src/user/user.module");
const folder_module_1 = require("src/folder/folder.module");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
const project_setting_entity_1 = require("src/project-setting/entity/project-setting.entity");
const products_module_1 = require("src/products/products.module");
const gallery_setting_entity_1 = require("src/gallery-setting/entity/gallery-setting.entity");
const upload_module_1 = require("src/upload/upload.module");
const product_entity_1 = require("src/products/entity/product.entity");
const password_service_1 = require("src/user/services/password/password.service");
const archive_project_entity_1 = require("./entities/archive-project.entity");
const notification_module_1 = require("src/notification/notification.module");
const site_setting_module_1 = require("src/site-setting/site-setting.module");
let ProjectsModule = class ProjectsModule {
};
ProjectsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                project_entity_1.Project,
                user_entity_1.User,
                shared_user_entity_1.SharedUser,
                upload_entity_1.Upload,
                project_setting_entity_1.ProjectSetting,
                gallery_setting_entity_1.GallerySetting,
                product_entity_1.Product,
                archive_project_entity_1.ArchivedProject,
            ]),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            (0, common_1.forwardRef)(() => shared_user_module_1.SharedUserModule),
            (0, common_1.forwardRef)(() => folder_module_1.FolderModule),
            products_module_1.ProductsModule,
            upload_module_1.UploadModule,
            notification_module_1.NotificationModule,
            site_setting_module_1.SiteSettingModule,
        ],
        controllers: [project_controller_1.ProjectsController],
        providers: [projects_service_1.ProjectsService, password_service_1.PasswordService],
        exports: [projects_service_1.ProjectsService],
    })
], ProjectsModule);
exports.ProjectsModule = ProjectsModule;
//# sourceMappingURL=project.module.js.map