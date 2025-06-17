"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteSettingModule = void 0;
const common_1 = require("@nestjs/common");
const site_setting_controller_1 = require("./site-setting.controller");
const site_setting_service_1 = require("./site-setting.service");
const typeorm_1 = require("@nestjs/typeorm");
const site_setting_entity_1 = require("./entity/site-setting.entity");
const upload_module_1 = require("src/upload/upload.module");
const user_entity_1 = require("src/user/entities/user.entity");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
const datahub_module_1 = require("src/datahub/datahub.module");
const portfolio_view_entity_1 = require("./entity/portfolio-view.entity");
let SiteSettingModule = class SiteSettingModule {
};
SiteSettingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            upload_module_1.UploadModule,
            typeorm_1.TypeOrmModule.forFeature([site_setting_entity_1.SiteSetting, user_entity_1.User, upload_entity_1.Upload, portfolio_view_entity_1.PortfolioView]),
            datahub_module_1.DatahubModule,
        ],
        controllers: [site_setting_controller_1.SiteSettingController],
        providers: [site_setting_service_1.SiteSettingService],
        exports: [site_setting_service_1.SiteSettingService],
    })
], SiteSettingModule);
exports.SiteSettingModule = SiteSettingModule;
//# sourceMappingURL=site-setting.module.js.map