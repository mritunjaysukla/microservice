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
exports.SitePortfolioImagesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const site_portfolio_images_service_1 = require("./site-portfolio-images.service");
const create_portfolio_images_dto_1 = require("./dto/create-portfolio-images.dto");
const auth_decorator_1 = require("src/common/decorator/auth.decorator");
let SitePortfolioImagesController = class SitePortfolioImagesController {
    constructor(imagesService) {
        this.imagesService = imagesService;
    }
    async addImages(portfolioId, req, files) {
        const userId = req.user.id;
        return this.imagesService.addImages(userId, portfolioId, files);
    }
    async deleteImage(id, req) {
        await this.imagesService.deleteImage(id, req.user.id);
        return { message: 'Image deleted successfully' };
    }
};
__decorate([
    (0, common_1.Post)(':portfolioId'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('images')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({ type: create_portfolio_images_dto_1.CreatePortfolioImagesDto }),
    __param(0, (0, common_1.Param)('portfolioId')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.UploadedFiles)(new common_1.ParseFilePipe({
        validators: [
            new common_1.FileTypeValidator({ fileType: '.(jpg|jpeg|png)' }),
            new common_1.MaxFileSizeValidator({ maxSize: 1024 * 1024 * 2 }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Array]),
    __metadata("design:returntype", Promise)
], SitePortfolioImagesController.prototype, "addImages", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SitePortfolioImagesController.prototype, "deleteImage", null);
SitePortfolioImagesController = __decorate([
    (0, swagger_1.ApiTags)('Site Portfolio Images'),
    (0, common_1.Controller)('site-portfolio-images'),
    __metadata("design:paramtypes", [site_portfolio_images_service_1.SitePortfolioImagesService])
], SitePortfolioImagesController);
exports.SitePortfolioImagesController = SitePortfolioImagesController;
//# sourceMappingURL=site-portfolio-images.controller.js.map