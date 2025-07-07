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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var ZipCleanupCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipCleanupCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const client_s3_1 = require("@aws-sdk/client-s3");
const ioredis_1 = __importDefault(require("ioredis"));
function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    if (typeof error === 'string')
        return error;
    if (error && typeof error === 'object' && 'message' in error)
        return String(error.message);
    return 'Unknown error occurred';
}
let ZipCleanupCron = ZipCleanupCron_1 = class ZipCleanupCron {
    constructor() {
        this.logger = new common_1.Logger(ZipCleanupCron_1.name);
        this.s3 = new client_s3_1.S3Client({
            region: process.env.S3_REGION,
            endpoint: process.env.S3_ENDPOINT,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY,
            },
            forcePathStyle: true,
        });
        this.redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        });
    }
    async handleCleanup() {
        const bucket = process.env.S3_BUCKET_NAME || '';
        try {
            const listCmd = new client_s3_1.ListObjectsV2Command({
                Bucket: bucket,
                Prefix: 'zips/',
            });
            const { Contents } = await this.s3.send(listCmd);
            const expired = Contents?.filter((f) => {
                const age = Date.now() - new Date(f.LastModified).getTime();
                return age > 6 * 60 * 60 * 1000;
            });
            if (expired?.length) {
                const deleteCmd = new client_s3_1.DeleteObjectsCommand({
                    Bucket: bucket,
                    Delete: {
                        Objects: expired.map((f) => ({ Key: f.Key })),
                    },
                });
                await this.s3.send(deleteCmd);
                this.logger.log(`Deleted ${expired.length} expired ZIPs`);
            }
            const keys = await this.redis.keys('zip:*');
            if (keys.length) {
                await this.redis.del(...keys);
                this.logger.log(`Deleted ${keys.length} Redis cache keys`);
            }
        }
        catch (err) {
            this.logger.error(`Cron cleanup failed: ${getErrorMessage(err)}`);
        }
    }
};
exports.ZipCleanupCron = ZipCleanupCron;
__decorate([
    (0, schedule_1.Cron)('0 */6 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ZipCleanupCron.prototype, "handleCleanup", null);
exports.ZipCleanupCron = ZipCleanupCron = ZipCleanupCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ZipCleanupCron);
//# sourceMappingURL=zip-cleanup.cron.js.map