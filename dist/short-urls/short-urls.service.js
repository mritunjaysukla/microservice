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
exports.ShortUrlService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const nanoid_1 = require("nanoid");
const short_url_entity_1 = require("./entity/short-url.entity");
const validUrl = require("valid-url");
let ShortUrlService = class ShortUrlService {
    constructor(shortUrlRepository) {
        this.shortUrlRepository = shortUrlRepository;
    }
    async createShortUrl(originalUrl) {
        if (!originalUrl || !validUrl.isUri(originalUrl)) {
            throw new common_1.BadRequestException('Invalid URL format');
        }
        const slug = (0, nanoid_1.nanoid)(7);
        const exists = await this.shortUrlRepository.findOne({ where: { slug } });
        if (exists) {
            return this.createShortUrl(originalUrl);
        }
        const newEntry = this.shortUrlRepository.create({
            slug,
            originalUrl,
        });
        await this.shortUrlRepository.save(newEntry);
        return slug;
    }
    async getOriginalUrl(slug) {
        console.log('Looking for slug:', slug);
        const entry = await this.shortUrlRepository.findOne({
            where: { slug },
        });
        console.log('Database entry found:', entry);
        if (!entry) {
            throw new common_1.NotFoundException('Original URL not found');
        }
        return entry.originalUrl;
    }
};
ShortUrlService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(short_url_entity_1.ShortUrl)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ShortUrlService);
exports.ShortUrlService = ShortUrlService;
//# sourceMappingURL=short-urls.service.js.map