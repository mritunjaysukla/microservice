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
var DatahubService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatahubService = void 0;
const cache_manager_1 = require("@nestjs/cache-manager");
const common_1 = require("@nestjs/common");
const AWS = require("aws-sdk");
const p_limit_1 = require("p-limit");
let DatahubService = DatahubService_1 = class DatahubService {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(DatahubService_1.name);
        this.CONCURRENCY_LIMIT = 10;
        const s3Config = {
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_KEY,
            region: process.env.S3_REGION,
            endpoint: process.env.S3_ENDPOINT,
            s3ForcePathStyle: true,
            signatureVersion: 'v4',
        };
        this.s3 = new AWS.S3(s3Config);
    }
    async uploadFile(folderPath, file) {
        const sanitizeFileName = (name) => {
            return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        };
        const safeFileName = `${Date.now()}_${sanitizeFileName(file.originalname)}`;
        const folder = `${folderPath}/${safeFileName}`;
        const params = {
            Bucket: process.env.S3_BUCKET_NAME || '',
            Key: folder,
            Body: file.buffer,
            ContentType: file.mimetype,
        };
        try {
            const uploadResult = await this.s3
                .upload(params, {
                partSize: 10 * 1024 * 1024,
                queueSize: 4,
            })
                .promise();
            console.log(uploadResult);
            this.logger.log(`File uploaded successfully: ${uploadResult.Location}`);
            const downloadUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${folder}`;
            return {
                fileName: safeFileName,
                downloadUrl: downloadUrl,
                message: 'File uploaded successfully',
            };
        }
        catch (error) {
            this.logger.error(`Failed to upload file to S3: ${error.message}`);
            throw new Error('File upload failed');
        }
    }
    async generatePresignedUrl(userId, fileName) {
        const s3Params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: `${userId}/${fileName}`,
            Expires: 60,
            ContentType: 'image/jpeg',
        };
        try {
            const url = await this.s3.getSignedUrlPromise('putObject', s3Params);
            return url;
        }
        catch (error) {
            this.logger.error(`Error generating presigned URL: ${error.message}`);
            throw new Error('Failed to generate presigned URL');
        }
    }
    async deleteFile(fileName) {
        this.logger.log(`Attempting to delete file with key: ${fileName}`);
        const params = {
            Bucket: process.env.S3_BUCKET_NAME || '',
            Key: fileName,
        };
        try {
            await this.s3.deleteObject(params).promise();
            this.logger.log(`File deleted successfully: ${fileName}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete file from S3: ${error.message}`);
            throw new Error('File deletion failed');
        }
    }
    async listAllObjectsInBucket() {
        const allKeys = [];
        try {
            const params = {
                Bucket: process.env.S3_BUCKET_NAME || '',
            };
            const result = await this.s3.listObjectsV2(params).promise();
            if (result.Contents) {
                result.Contents.forEach((object) => {
                    allKeys.push(object.Key);
                });
            }
            return allKeys;
        }
        catch (error) {
            this.logger.error(`Error listing objects in the bucket: ${error.message}`);
            throw new Error('Failed to list objects');
        }
    }
    async deleteBucket() {
        const bucketName = process.env.S3_BUCKET_NAME || '';
        try {
            let isTruncated = true;
            let versionIdMarker = undefined;
            while (isTruncated) {
                const listParams = {
                    Bucket: bucketName,
                    VersionIdMarker: versionIdMarker,
                };
                const result = await this.s3.listObjectVersions(listParams).promise();
                if (result.Versions) {
                    const deleteParams = {
                        Bucket: bucketName,
                        Delete: {
                            Objects: result.Versions.map((version) => ({
                                Key: version.Key,
                                VersionId: version.VersionId,
                            })),
                        },
                    };
                    await this.s3.deleteObjects(deleteParams).promise();
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
                const listParams = {
                    Bucket: bucketName,
                    KeyMarker: keyMarker,
                };
                const result = await this.s3.listMultipartUploads(listParams).promise();
                if (result.Uploads) {
                    for (const upload of result.Uploads) {
                        const abortParams = {
                            Bucket: bucketName,
                            Key: upload.Key,
                            UploadId: upload.UploadId,
                        };
                        await this.s3.abortMultipartUpload(abortParams).promise();
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
            let marker = undefined;
            while (isTruncated) {
                const listParams = {
                    Bucket: bucketName,
                    ContinuationToken: marker,
                };
                const result = await this.s3.listObjectsV2(listParams).promise();
                if (result.Contents) {
                    const deleteParams = {
                        Bucket: bucketName,
                        Delete: {
                            Objects: result.Contents.map((object) => ({
                                Key: object.Key,
                            })),
                        },
                    };
                    await this.s3.deleteObjects(deleteParams).promise();
                }
                if (result.IsTruncated) {
                    marker = result.NextContinuationToken;
                }
                else {
                    isTruncated = false;
                }
            }
            const params = {
                Bucket: bucketName,
            };
            await this.s3.deleteBucket(params).promise();
            this.logger.log(`Bucket ${bucketName} deleted successfully.`);
        }
        catch (error) {
            this.logger.error(`Failed to delete bucket ${bucketName}: ${error.message}`);
            throw new Error('Bucket deletion failed');
        }
    }
    async generatePresignedUrlForUpload(fileName, contentType) {
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            Expires: 3600,
            ContentType: contentType,
        };
        return this.s3.getSignedUrlPromise('putObject', params);
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
            console.log('from cache');
            return cachedUrl;
        }
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            Expires: 3600,
        };
        try {
            const url = await this.s3.getSignedUrlPromise('getObject', params);
            const modifiedUrl = url.replace('s3-np1.datahub.com.np/fotosfolio/', 'cdn.fotosfolio.com/');
            await this.cacheManager.set(cacheKey, modifiedUrl, 3600);
            return modifiedUrl;
        }
        catch (error) {
            throw new Error(`Failed to generate pre-signed URL: ${error.message}`);
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