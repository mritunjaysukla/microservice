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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var DatahubService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatahubService = void 0;
const cache_manager_1 = require("@nestjs/cache-manager");
const common_1 = require("@nestjs/common");
const p_limit_1 = __importDefault(require("p-limit"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
function getErrorMessage(error) {
    if (error instanceof Error)
        return error.message;
    if (typeof error === 'string')
        return error;
    if (error && typeof error === 'object' && 'message' in error)
        return String(error.message);
    return 'Unknown error occurred';
}
let DatahubService = DatahubService_1 = class DatahubService {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(DatahubService_1.name);
        this.CONCURRENCY_LIMIT = 10;
        this.s3 = new client_s3_1.S3Client({
            region: process.env.S3_REGION,
            endpoint: process.env.S3_ENDPOINT,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY,
                secretAccessKey: process.env.S3_SECRET_KEY,
            },
            forcePathStyle: true,
        });
    }
    async uploadFile(folderPath, file) {
        const sanitizeFileName = (name) => name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const safeFileName = `${Date.now()}_${sanitizeFileName(file.originalname)}`;
        const folder = `${folderPath}/${safeFileName}`;
        const params = {
            Bucket: process.env.S3_BUCKET_NAME || '',
            Key: folder,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
        try {
            const command = new client_s3_1.PutObjectCommand(params);
            await this.s3.send(command);
            this.logger.log(`File uploaded successfully: ${folder}`);
            const downloadUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${folder}`;
            return {
                fileName: safeFileName,
                downloadUrl,
                message: 'File uploaded successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to upload file to S3: ${getErrorMessage(error)}`);
            throw new Error('File upload failed');
        }
    }
    async generatePresignedUrl(userId, fileName) {
        const key = `${userId}/${fileName}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            ContentType: 'image/jpeg',
        });
        try {
            return await (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn: 60 });
        }
        catch (error) {
            this.logger.error(`Error generating presigned URL: ${getErrorMessage(error)}`);
            throw new Error('Failed to generate presigned URL');
        }
    }
    async deleteFile(fileName) {
        this.logger.log(`Attempting to delete file with key: ${fileName}`);
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || '',
            Key: fileName,
        });
        try {
            await this.s3.send(command);
            this.logger.log(`File deleted successfully: ${fileName}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete file from S3: ${getErrorMessage(error)}`);
            throw new Error('File deletion failed');
        }
    }
    async listAllObjectsInBucket() {
        const allKeys = [];
        let continuationToken = undefined;
        try {
            do {
                const command = new client_s3_1.ListObjectsV2Command({
                    Bucket: process.env.S3_BUCKET_NAME || '',
                    ContinuationToken: continuationToken,
                });
                const result = await this.s3.send(command);
                if (result.Contents) {
                    result.Contents.forEach((object) => {
                        if (object.Key)
                            allKeys.push(object.Key);
                    });
                }
                continuationToken = result.NextContinuationToken;
            } while (continuationToken);
            return allKeys;
        }
        catch (error) {
            this.logger.error(`Error listing objects in the bucket: ${getErrorMessage(error)}`);
            throw new Error('Failed to list objects');
        }
    }
    async deleteBucket() {
        const bucketName = process.env.S3_BUCKET_NAME || '';
        try {
            let isTruncated = true;
            let versionIdMarker = undefined;
            while (isTruncated) {
                const listVersionsCommand = new client_s3_1.ListObjectVersionsCommand({
                    Bucket: bucketName,
                    VersionIdMarker: versionIdMarker,
                });
                const result = await this.s3.send(listVersionsCommand);
                if (result.Versions && result.Versions.length > 0) {
                    const deleteParams = {
                        Bucket: bucketName,
                        Delete: {
                            Objects: result.Versions.map((version) => ({
                                Key: version.Key,
                                VersionId: version.VersionId,
                            })),
                        },
                    };
                    const deleteCommand = new client_s3_1.DeleteObjectsCommand(deleteParams);
                    await this.s3.send(deleteCommand);
                }
                if (result.IsTruncated) {
                    versionIdMarker = result.NextVersionIdMarker;
                }
                else {
                    isTruncated = false;
                }
            }
            isTruncated = true;
            let keyMarker = undefined;
            while (isTruncated) {
                const listMultipartCommand = new client_s3_1.ListMultipartUploadsCommand({
                    Bucket: bucketName,
                    KeyMarker: keyMarker,
                });
                const result = await this.s3.send(listMultipartCommand);
                if (result.Uploads) {
                    for (const upload of result.Uploads) {
                        const abortCommand = new client_s3_1.AbortMultipartUploadCommand({
                            Bucket: bucketName,
                            Key: upload.Key,
                            UploadId: upload.UploadId,
                        });
                        await this.s3.send(abortCommand);
                    }
                }
                if (result.IsTruncated) {
                    keyMarker = result.NextKeyMarker;
                }
                else {
                    isTruncated = false;
                }
            }
            isTruncated = true;
            let continuationToken = undefined;
            while (isTruncated) {
                const listObjectsCommand = new client_s3_1.ListObjectsV2Command({
                    Bucket: bucketName,
                    ContinuationToken: continuationToken,
                });
                const result = await this.s3.send(listObjectsCommand);
                if (result.Contents && result.Contents.length > 0) {
                    const deleteParams = {
                        Bucket: bucketName,
                        Delete: {
                            Objects: result.Contents.map((object) => ({
                                Key: object.Key,
                            })),
                        },
                    };
                    const deleteCommand = new client_s3_1.DeleteObjectsCommand(deleteParams);
                    await this.s3.send(deleteCommand);
                }
                if (result.IsTruncated) {
                    continuationToken = result.NextContinuationToken;
                }
                else {
                    isTruncated = false;
                }
            }
            const deleteBucketCommand = new client_s3_1.DeleteBucketCommand({
                Bucket: bucketName,
            });
            await this.s3.send(deleteBucketCommand);
            this.logger.log(`Bucket ${bucketName} deleted successfully.`);
        }
        catch (error) {
            this.logger.error(`Failed to delete bucket ${bucketName}: ${getErrorMessage(error)}`);
            throw new Error('Bucket deletion failed');
        }
    }
    async generatePresignedUrlForUpload(fileName, contentType) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            ContentType: contentType,
        });
        try {
            return await (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn: 3600 });
        }
        catch (error) {
            this.logger.error(`Failed to generate presigned URL: ${getErrorMessage(error)}`);
            throw new Error('Failed to generate presigned URL');
        }
    }
    async generateMultiplePresignedUrlsForUpload(files) {
        const limit = (0, p_limit_1.default)(this.CONCURRENCY_LIMIT);
        const tasks = files.map(({ fileName, contentType }) => limit(() => this.generatePresignedUrlForUpload(fileName, contentType)));
        return Promise.all(tasks);
    }
    async generateGetPresignedUrl(fileName) {
        const cacheKey = `presigned-url:${fileName}`;
        const cachedUrl = await this.cacheManager.get(cacheKey);
        if (cachedUrl) {
            this.logger.log(`Get presigned URL cache hit for ${fileName}`);
            return cachedUrl;
        }
        const command = new client_s3_1.GetObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
        });
        try {
            const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn: 3600 });
            const modifiedUrl = url.replace('s3-np1.datahub.com.np/fotosfolio/', 'cdn.fotosfolio.com/');
            await this.cacheManager.set(cacheKey, modifiedUrl, 3600);
            return modifiedUrl;
        }
        catch (error) {
            throw new Error(`Failed to generate pre-signed URL: ${getErrorMessage(error)}`);
        }
    }
};
exports.DatahubService = DatahubService;
exports.DatahubService = DatahubService = DatahubService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], DatahubService);
//# sourceMappingURL=datahub.service.js.map