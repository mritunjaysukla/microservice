"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavFolderModule = void 0;
const common_1 = require("@nestjs/common");
const fav_folder_service_1 = require("./fav-folder.service");
const fav_folder_controller_1 = require("./fav-folder.controller");
const fav_files_entity_1 = require("./entity/fav-files.entity");
const fav_folder_entity_1 = require("./entity/fav-folder.entity");
const user_module_1 = require("src/user/user.module");
const typeorm_1 = require("@nestjs/typeorm");
const upload_module_1 = require("src/upload/upload.module");
let FavFolderModule = class FavFolderModule {
};
FavFolderModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([fav_files_entity_1.FavoriteFile, fav_folder_entity_1.FavoriteFolder]), user_module_1.UserModule, upload_module_1.UploadModule],
        providers: [fav_folder_service_1.FavFolderService],
        controllers: [fav_folder_controller_1.FavFolderController]
    })
], FavFolderModule);
exports.FavFolderModule = FavFolderModule;
//# sourceMappingURL=fav-folder.module.js.map