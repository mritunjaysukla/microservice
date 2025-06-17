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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SitePortfolioController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const site_portfolio_service_1 = require("./site-portfolio.service");
const common_2 = require("@nestjs/common");
const create_site_portfolio_dto_1 = require("./dto/create-site-portfolio.dto");
const update_site_portfolio_dto_1 = require("./dto/update-site-portfolio.dto");
const auth_decorator_1 = require("src/common/decorator/auth.decorator");
let SitePortfolioController = class SitePortfolioController {
    constructor(portfolioService) {
        this.portfolioService = portfolioService;
    }
    async create(req, createDto, thumbnail) {
        const userId = req.user.id;
        return this.portfolioService.create(userId, createDto, thumbnail);
    }
    async update(id, req, updateDto, thumbnail) {
        const userId = req.user.id;
        return this.portfolioService.update(id, userId, updateDto, thumbnail);
    }
};
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('thumbnail')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ type: create_site_portfolio_dto_1.CreateSitePortfolioDto }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)(new common_2.ParseFilePipe({
        validators: [
            new common_2.FileTypeValidator({ fileType: '.(jpg|jpeg|png)' }),
            new common_2.MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }),
        ],
        fileIsRequired: false,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_site_portfolio_dto_1.CreateSitePortfolioDto, Object]),
    __metadata("design:returntype", Promise)
], SitePortfolioController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('thumbnail')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ type: update_site_portfolio_dto_1.UpdateSitePortfolioDto }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFile)(new common_2.ParseFilePipe({
        validators: [
            new common_2.FileTypeValidator({ fileType: '.(jpg|jpeg|png)' }),
            new common_2.MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }),
        ],
        fileIsRequired: false,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, update_site_portfolio_dto_1.UpdateSitePortfolioDto, Object]),
    __metadata("design:returntype", Promise)
], SitePortfolioController.prototype, "update", null);
SitePortfolioController = __decorate([
    (0, swagger_1.ApiTags)('Site Portfolio'),
    (0, common_1.Controller)('site-portfolio'),
    __metadata("design:paramtypes", [site_portfolio_service_1.SitePortfolioService])
], SitePortfolioController);
exports.SitePortfolioController = SitePortfolioController;
//# sourceMappingURL=site-portfolio.controller.js.map