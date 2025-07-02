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
exports.ZipController = void 0;
const common_1 = require("@nestjs/common");
const zip_service_1 = require("./zip.service");
const zip_request_dto_1 = require("./dto/zip-request.dto");
const swagger_1 = require("@nestjs/swagger");
let ZipController = class ZipController {
    constructor(zipService) {
        this.zipService = zipService;
    }
    async createZipJob(dto) {
        if (!dto.fileUrls || dto.fileUrls.length === 0) {
            throw new common_1.HttpException('No file URLs provided', common_1.HttpStatus.BAD_REQUEST);
        }
        if (dto.fileUrls.length > 100) {
            throw new common_1.HttpException('Maximum 100 files allowed per zip job', common_1.HttpStatus.PAYLOAD_TOO_LARGE);
        }
        const jobId = await this.zipService.createZipJob(dto);
        return {
            jobId,
            message: 'Zip job created successfully',
            estimatedTime: '2-5 minutes depending on file sizes'
        };
    }
    async getJobStatus(jobId) {
        const status = await this.zipService.getJobStatus(jobId);
        if (status.status === 'not_found') {
            throw new common_1.HttpException('Job not found', common_1.HttpStatus.NOT_FOUND);
        }
        return status;
    }
    async downloadZip(jobId, res, inline) {
        await this.zipService.downloadZip(jobId, res, inline);
    }
    async listJobs(status, limit = 20) {
        return await this.zipService.listJobs(status, limit);
    }
    async cancelJob(jobId) {
        const result = await this.zipService.cancelJob(jobId);
        return result;
    }
    async healthCheck() {
        return await this.zipService.getHealthStatus();
    }
};
exports.ZipController = ZipController;
__decorate([
    (0, common_1.Post)('create-job'),
    (0, swagger_1.ApiOperation)({
        summary: 'Create asynchronous zip job',
        description: 'Creates a background job to zip files from S3 presigned URLs. Returns job ID for tracking.'
    }),
    (0, swagger_1.ApiBody)({
        type: zip_request_dto_1.ZipRequestDto,
        description: 'Array of presigned S3 URLs and desired zip filename',
        examples: {
            example1: {
                summary: 'Basic zip request',
                value: {
                    fileUrls: [
                        'https://s3-endpoint.com/bucket/file1.jpg?presigned-params',
                        'https://s3-endpoint.com/bucket/file2.png?presigned-params'
                    ],
                    zipFileName: 'my-photos.zip'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 202,
        description: 'Zip job created successfully',
        schema: {
            type: 'object',
            properties: {
                jobId: {
                    type: 'string',
                    example: 'job-12345678-1234-1234-1234-123456789012'
                },
                message: {
                    type: 'string',
                    example: 'Zip job created successfully'
                },
                estimatedTime: {
                    type: 'string',
                    example: '2-5 minutes depending on file sizes'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Invalid request - empty file URLs or invalid data',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 400 },
                message: { type: 'string', example: 'No file URLs provided' },
                error: { type: 'string', example: 'Bad Request' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 413,
        description: 'Too many files - exceeds maximum limit',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 413 },
                message: { type: 'string', example: 'Maximum 100 files allowed per zip job' },
                error: { type: 'string', example: 'Payload Too Large' }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [zip_request_dto_1.ZipRequestDto]),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "createZipJob", null);
__decorate([
    (0, common_1.Get)('status/:jobId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get zip job status',
        description: 'Check the current status of a zip job. Use this to poll for completion.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'jobId',
        description: 'Job ID returned from create-job endpoint',
        example: 'job-12345678-1234-1234-1234-123456789012'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Job status retrieved successfully',
        schema: {
            oneOf: [
                {
                    title: 'Pending Job',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'pending' },
                        message: { type: 'string', example: 'Job is queued for processing' }
                    }
                },
                {
                    title: 'Processing Job',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'processing' },
                        message: { type: 'string', example: 'Files are being zipped' },
                        progress: { type: 'string', example: '45% complete' }
                    }
                },
                {
                    title: 'Completed Job',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'completed' },
                        downloadUrl: { type: 'string', example: '/zip/download/job-123456' },
                        fileSize: { type: 'string', example: '15.2 MB' },
                        expiresAt: { type: 'string', example: '2024-12-25T10:00:00Z' }
                    }
                },
                {
                    title: 'Failed Job',
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'failed' },
                        error: { type: 'string', example: 'Failed to access some files' },
                        partialSuccess: { type: 'boolean', example: true },
                        successCount: { type: 'number', example: 8 },
                        totalCount: { type: 'number', example: 10 }
                    }
                }
            ]
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Job not found',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 404 },
                message: { type: 'string', example: 'Job not found' },
                error: { type: 'string', example: 'Not Found' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "getJobStatus", null);
__decorate([
    (0, common_1.Get)('download/:jobId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Download completed zip file',
        description: 'Download the zip file once job is completed. File will be automatically deleted after download.'
    }),
    (0, swagger_1.ApiParam)({
        name: 'jobId',
        description: 'Job ID of completed zip job',
        example: 'job-12345678-1234-1234-1234-123456789012'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'inline',
        required: false,
        description: 'Set to true to view file inline instead of download',
        example: false
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Zip file download started',
        headers: {
            'Content-Type': {
                description: 'application/zip',
                schema: { type: 'string' }
            },
            'Content-Disposition': {
                description: 'attachment; filename="archive.zip"',
                schema: { type: 'string' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Zip file not found or not ready',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 404 },
                message: { type: 'string', example: 'Zip file not found or not ready' },
                error: { type: 'string', example: 'Not Found' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 410,
        description: 'Zip file has expired and been deleted',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 410 },
                message: { type: 'string', example: 'Zip file has expired. Please create a new job.' },
                error: { type: 'string', example: 'Gone' }
            }
        }
    }),
    __param(0, (0, common_1.Param)('jobId')),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('inline')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Boolean]),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "downloadZip", null);
__decorate([
    (0, common_1.Get)('jobs'),
    (0, swagger_1.ApiOperation)({
        summary: 'List active zip jobs',
        description: 'Get list of all active jobs (pending, processing) for monitoring'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'status',
        required: false,
        description: 'Filter jobs by status',
        enum: ['pending', 'processing', 'completed', 'failed']
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Maximum number of jobs to return',
        example: 20
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of jobs retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                jobs: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            jobId: { type: 'string' },
                            status: { type: 'string' },
                            createdAt: { type: 'string' },
                            fileCount: { type: 'number' },
                            zipFileName: { type: 'string' }
                        }
                    }
                },
                total: { type: 'number' }
            }
        }
    }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "listJobs", null);
__decorate([
    (0, common_1.Post)('cancel/:jobId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Cancel a pending or processing zip job',
        description: 'Cancel a job that is still pending or processing'
    }),
    (0, swagger_1.ApiParam)({
        name: 'jobId',
        description: 'Job ID to cancel'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Job cancelled successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Job cancelled successfully' },
                jobId: { type: 'string' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Job not found'
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'Job cannot be cancelled (already completed or failed)'
    }),
    __param(0, (0, common_1.Param)('jobId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "cancelJob", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Check service health',
        description: 'Health check endpoint for monitoring service status and worker threads'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service is healthy',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'healthy' },
                workers: {
                    type: 'object',
                    properties: {
                        active: { type: 'number', example: 2 },
                        total: { type: 'number', example: 4 },
                        queue: { type: 'number', example: 1 }
                    }
                },
                redis: { type: 'string', example: 'connected' },
                uptime: { type: 'string', example: '2h 34m' }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "healthCheck", null);
exports.ZipController = ZipController = __decorate([
    (0, swagger_1.ApiTags)('Zip Operations'),
    (0, common_1.Controller)('zip'),
    __metadata("design:paramtypes", [zip_service_1.ZipService])
], ZipController);
//# sourceMappingURL=zip.controller.js.map