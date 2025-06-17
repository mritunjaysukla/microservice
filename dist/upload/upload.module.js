"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadModule = void 0;
const common_1 = require("@nestjs/common");
const backblaze_module_1 = require("src/backblaze/backblaze.module");
const backblaze_service_1 = require("src/backblaze/backblaze.service");
const upload_controller_1 = require("./upload.controller");
const upload_service_1 = require("./upload.service");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
const user_entity_1 = require("src/user/entities/user.entity");
const project_entity_1 = require("src/project/entities/project.entity");
const userStorage_entity_1 = require("src/storage/entity/userStorage.entity");
const subscription_entity_1 = require("src/subscription/entity/subscription.entity");
const folder_entity_1 = require("src/folder/entity/folder.entity");
const datahub_module_1 = require("src/datahub/datahub.module");
const datahub_service_1 = require("../datahub/datahub.service");
const user_session_entity_1 = require("src/user/entities/user-session.entity");
const storage_module_1 = require("src/storage/storage.module");
const trash_entity_1 = require("src/backblaze/entity/trash.entity");
const extensions_entity_1 = require("src/backblaze/entity/extensions.entity");
let UploadModule = class UploadModule {
};
UploadModule = __decorate([
    (0, common_1.Module)({
        imports: [
            datahub_module_1.DatahubModule,
            backblaze_module_1.BlackblazeModule,
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([
                upload_entity_1.Upload,
                user_entity_1.User,
                project_entity_1.Project,
                userStorage_entity_1.UserStorage,
                subscription_entity_1.Subscription,
                folder_entity_1.Folder,
                user_session_entity_1.UserSession,
                trash_entity_1.Trash,
                extensions_entity_1.FileExtension,
            ]),
            (0, common_1.forwardRef)(() => storage_module_1.StorageModule),
        ],
        controllers: [upload_controller_1.UploadController],
        providers: [upload_service_1.UploadService, backblaze_service_1.BackblazeService, datahub_service_1.DatahubService],
        exports: [upload_service_1.UploadService, datahub_service_1.DatahubService],
    })
], UploadModule);
exports.UploadModule = UploadModule;
//# sourceMappingURL=upload.module.js.map