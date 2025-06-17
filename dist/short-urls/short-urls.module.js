"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShortUrlModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const short_url_entity_1 = require("./entity/short-url.entity");
const short_urls_controller_1 = require("./short-urls.controller");
const short_urls_service_1 = require("./short-urls.service");
const axios_1 = require("@nestjs/axios");
let ShortUrlModule = class ShortUrlModule {
};
ShortUrlModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([short_url_entity_1.ShortUrl]), axios_1.HttpModule],
        controllers: [short_urls_controller_1.ShortUrlController],
        providers: [short_urls_service_1.ShortUrlService],
    })
], ShortUrlModule);
exports.ShortUrlModule = ShortUrlModule;
//# sourceMappingURL=short-urls.module.js.map