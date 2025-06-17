"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SitePortfolioImagesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const site_portfolio_images_entity_1 = require("./entity/site-portfolio-images.entity");
const site_portfolio_entity_1 = require("../site-portfolio/entity/site-portfolio.entity");
const user_entity_1 = require("../user/entities/user.entity");
const site_portfolio_images_controller_1 = require("./site-portfolio-images.controller");
const site_portfolio_images_service_1 = require("./site-portfolio-images.service");
const upload_module_1 = require("../upload/upload.module");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
let SitePortfolioImagesModule = class SitePortfolioImagesModule {
};
SitePortfolioImagesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                site_portfolio_images_entity_1.SitePortfolioImages,
                site_portfolio_entity_1.SitePortfolio,
                user_entity_1.User,
                upload_entity_1.Upload,
            ]),
            upload_module_1.UploadModule,
        ],
        controllers: [site_portfolio_images_controller_1.SitePortfolioImagesController],
        providers: [site_portfolio_images_service_1.SitePortfolioImagesService],
    })
], SitePortfolioImagesModule);
exports.SitePortfolioImagesModule = SitePortfolioImagesModule;
//# sourceMappingURL=site-portfolio-images.module.js.map