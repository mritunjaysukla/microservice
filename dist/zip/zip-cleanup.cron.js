"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const ioredis_1 = __importDefault(require("ioredis"));
const fs_1 = require("fs");
const path = __importStar(require("path"));
function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    if (typeof error === 'string')
        return error;
    return 'Unknown error occurred';
}
let ZipCleanupCron = ZipCleanupCron_1 = class ZipCleanupCron {
    constructor() {
        this.logger = new common_1.Logger(ZipCleanupCron_1.name);
        this.redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        });
    }
    async handleCleanup() {
        try {
            const metaKeys = await this.redis.keys('zip:meta:*');
            let deletedCount = 0;
            for (const key of metaKeys) {
                const ttl = await this.redis.ttl(key);
                if (ttl < 3600) {
                    const metaData = await this.redis.get(key);
                    if (metaData) {
                        const meta = JSON.parse(metaData);
                        const zipFilePath = meta.filePath;
                        if (zipFilePath && (await fs_1.promises.stat(zipFilePath).catch(() => null))) {
                            await fs_1.promises.unlink(zipFilePath);
                            this.logger.log(`Deleted zip file: ${zipFilePath}`);
                        }
                    }
                    await this.redis.del(key);
                    deletedCount++;
                }
            }
            const zipDir = path.join(process.cwd(), 'tmp', 'zips');
            const dirExists = await fs_1.promises
                .stat(zipDir)
                .then(() => true)
                .catch(() => false);
            if (dirExists) {
                const files = await fs_1.promises.readdir(zipDir);
                const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
                for (const file of files) {
                    const filePath = path.join(zipDir, file);
                    const stats = await fs_1.promises.stat(filePath);
                    if (stats.mtime.getTime() < oneDayAgo) {
                        await fs_1.promises.unlink(filePath);
                        this.logger.log(`Deleted orphaned zip file: ${filePath}`);
                    }
                }
            }
            this.logger.log(`Cleanup completed: ${deletedCount} Redis keys deleted`);
        }
        catch (err) {
            this.logger.error(`Cleanup failed: ${getErrorMessage(err)}`);
        }
    }
};
exports.ZipCleanupCron = ZipCleanupCron;
__decorate([
    (0, schedule_1.Cron)('0 2 * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ZipCleanupCron.prototype, "handleCleanup", null);
exports.ZipCleanupCron = ZipCleanupCron = ZipCleanupCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ZipCleanupCron);
//# sourceMappingURL=zip-cleanup.cron.js.map