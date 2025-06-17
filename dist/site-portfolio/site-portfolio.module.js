"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SitePortfolioModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const site_portfolio_entity_1 = require("./entity/site-portfolio.entity");
const site_setting_entity_1 = require("../site-setting/entity/site-setting.entity");
const user_entity_1 = require("../user/entities/user.entity");
const site_portfolio_controller_1 = require("./site-portfolio.controller");
const site_portfolio_service_1 = require("./site-portfolio.service");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
const upload_module_1 = require("src/upload/upload.module");
let SitePortfolioModule = class SitePortfolioModule {
};
SitePortfolioModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([site_portfolio_entity_1.SitePortfolio, site_setting_entity_1.SiteSetting, user_entity_1.User, upload_entity_1.Upload]),
            upload_module_1.UploadModule,
        ],
        controllers: [site_portfolio_controller_1.SitePortfolioController],
        providers: [site_portfolio_service_1.SitePortfolioService],
    })
], SitePortfolioModule);
exports.SitePortfolioModule = SitePortfolioModule;
//# sourceMappingURL=site-portfolio.module.js.map