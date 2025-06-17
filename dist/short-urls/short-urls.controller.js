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
exports.ShortUrlController = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const create_short_url_dto_1 = require("./dto/create-short-url.dto");
const rxjs_1 = require("rxjs");
const short_urls_service_1 = require("./short-urls.service");
let ShortUrlController = class ShortUrlController {
    constructor(shortUrlService, httpService) {
        this.shortUrlService = shortUrlService;
        this.httpService = httpService;
    }
    async createShortUrl(createShortUrlDto) {
        const { url } = createShortUrlDto;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            throw new common_1.BadRequestException('URL must start with http:// or https://');
        }
        const slug = await this.shortUrlService.createShortUrl(url);
        return {
            message: 'Short URL created successfully',
            slug,
            shortUrl: `${process.env.HOST_URL || 'http://localhost:3000'}/short/${slug}`,
        };
    }
    async serveProxiedContent(slug, res) {
        const originalUrl = await this.shortUrlService.getOriginalUrl(slug);
        console.log('Attempting to fetch:', originalUrl);
        try {
            const response = await (0, rxjs_1.lastValueFrom)(this.httpService.get(originalUrl, {
                responseType: 'stream',
                headers: {
                    'User-Agent': 'NestJS-ProxyBot/1.0',
                },
            }));
            console.log('Received response headers:', response.headers);
            res.set({
                'Content-Type': response.headers['content-type'] || 'text/html',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
            });
            response.data.pipe(res);
        }
        catch (err) {
            console.error('[Proxy Error]:', err);
            const axiosError = err;
            if (axiosError.response?.status === 404) {
                return res.status(404).json({
                    message: 'Original URL not found or is unavailable',
                    error: 'Not Found',
                });
            }
            throw new common_1.InternalServerErrorException('Failed to proxy the original content');
        }
    }
};
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_short_url_dto_1.CreateShortUrlDto]),
    __metadata("design:returntype", Promise)
], ShortUrlController.prototype, "createShortUrl", null);
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShortUrlController.prototype, "serveProxiedContent", null);
ShortUrlController = __decorate([
    (0, common_1.Controller)('short'),
    __metadata("design:paramtypes", [short_urls_service_1.ShortUrlService,
        axios_1.HttpService])
], ShortUrlController);
exports.ShortUrlController = ShortUrlController;
//# sourceMappingURL=short-urls.controller.js.map