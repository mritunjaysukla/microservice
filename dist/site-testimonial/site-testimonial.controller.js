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
exports.SiteTestimonialController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const create_site_testimonial_dto_1 = require("./dto/create-site-testimonial.dto");
const common_2 = require("@nestjs/common");
const site_testimonial_service_1 = require("./site-testimonial.service");
const auth_decorator_1 = require("src/common/decorator/auth.decorator");
const update_site_testimonial_dto_1 = require("./dto/update-site-testimonial.dto");
let SiteTestimonialController = class SiteTestimonialController {
    constructor(testimonialService) {
        this.testimonialService = testimonialService;
    }
    async findByUserId(userId) {
        return this.testimonialService.findByUserId(userId);
    }
    async create(req, createDto, clientImage) {
        const userId = req.user.id;
        return this.testimonialService.create(userId, createDto, clientImage);
    }
    async selectTestimonialsByIds(body) {
        const { ids } = body;
        return await this.testimonialService.selectMultipleTestimonialsByIds(ids);
    }
    async update(id, req, updateDto, clientImage) {
        const userId = req.user.id;
        return this.testimonialService.update(id, userId, updateDto, clientImage);
    }
    async findOne(id) {
        return this.testimonialService.findOne(id);
    }
};
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SiteTestimonialController.prototype, "findByUserId", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('clientImage')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        type: create_site_testimonial_dto_1.CreateSiteTestimonialDto,
    }),
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
    __metadata("design:paramtypes", [Object, create_site_testimonial_dto_1.CreateSiteTestimonialDto, Object]),
    __metadata("design:returntype", Promise)
], SiteTestimonialController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)('selectTestimonials'),
    (0, swagger_1.ApiBody)({
        description: 'Array of testimonial IDs (UUIDs) to be selected',
        type: Object,
        schema: {
            type: 'object',
            properties: {
                ids: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'uuid',
                    },
                },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SiteTestimonialController.prototype, "selectTestimonialsByIds", null);
__decorate([
    (0, common_1.Patch)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, auth_decorator_1.Auth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('clientImage')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        type: update_site_testimonial_dto_1.UpdateSiteTestimonialDto,
    }),
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
    __metadata("design:paramtypes", [String, Object, update_site_testimonial_dto_1.UpdateSiteTestimonialDto, Object]),
    __metadata("design:returntype", Promise)
], SiteTestimonialController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SiteTestimonialController.prototype, "findOne", null);
SiteTestimonialController = __decorate([
    (0, common_1.Controller)('site-testimonial'),
    __metadata("design:paramtypes", [site_testimonial_service_1.SiteTestimonialService])
], SiteTestimonialController);
exports.SiteTestimonialController = SiteTestimonialController;
//# sourceMappingURL=site-testimonial.controller.js.map