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
var BackblazeService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackblazeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const backblaze_b2_1 = require("backblaze-b2");
const typeorm_2 = require("typeorm");
const upload_entity_1 = require("./entity/upload.entity");
let BackblazeService = BackblazeService_1 = class BackblazeService {
    constructor(configService, uploadRepository) {
        this.configService = configService;
        this.uploadRepository = uploadRepository;
        this.logger = new common_1.Logger(BackblazeService_1.name);
        this.MAX_RETRIES = 3;
        this.RETRY_DELAY = 1000;
        const keyId = this.configService.get('BACKBLAZE_KEY_ID');
        const appKey = this.configService.get('BACKBLAZE_APPLICATION_KEY');
        const bucketId = this.configService.get('BACKBLAZE_BUCKET_ID');
        if (!keyId || !appKey || !bucketId) {
            throw new Error('Missing required Backblaze configuration');
        }
        this.bucketId = bucketId;
        this.b2 = new backblaze_b2_1.default({
            applicationKeyId: keyId,
            applicationKey: appKey,
        });
    }
    async delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async refreshCredentials() {
        try {
            const response = await this.b2.authorize();
            if (!response.data)
                throw new Error('No authorization data received');
            const { authorizationToken, apiUrl } = response.data;
            this.authToken = authorizationToken;
            this.apiUrl = apiUrl;
            this.tokenExpirationTime = Date.now() + 23 * 60 * 60 * 1000;
            this.logger.debug('Credentials refreshed successfully');
        }
        catch (error) {
            this.logger.error('Failed to refresh credentials:', error);
            throw error;
        }
    }
    async getUploadUrlWithRetry() {
        for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
            try {
                const response = await this.b2.getUploadUrl({
                    bucketId: this.bucketId,
                });
                if (!response.data?.uploadUrl || !response.data?.authorizationToken) {
                    throw new Error('Invalid upload URL response');
                }
                this.uploadUrl = response.data.uploadUrl;
                this.uploadAuthToken = response.data.authorizationToken;
                return;
            }
            catch (error) {
                if (attempt === this.MAX_RETRIES)
                    throw error;
                await this.delay(this.RETRY_DELAY * attempt);
            }
        }
    }
    isTokenExpired() {
        return !this.tokenExpirationTime || Date.now() >= this.tokenExpirationTime;
    }
    async getDownloadUrl(fileName) {
        const baseUrl = this.configService.get('BACKBLAZE_BUCKET_BASE_URL');
        if (!baseUrl) {
            throw new Error('BACKBLAZE_BUCKET_BASE_URL is not configured');
        }
        return `${baseUrl}/${encodeURIComponent(fileName)}`;
    }
    async getDownloadUrls(fileNames) {
        if (!fileNames?.length) {
            throw new Error('No file names provided');
        }
        return Promise.all(fileNames.map((fileName) => this.getDownloadUrl(fileName)));
    }
};
BackblazeService = BackblazeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(upload_entity_1.Upload)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], BackblazeService);
exports.BackblazeService = BackblazeService;
//# sourceMappingURL=backblaze.service.js.map