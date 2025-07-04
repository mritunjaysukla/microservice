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
    async createZip(dto, res) {
        return this.zipService.archiveAndStreamZip(dto, res);
    }
    async getHealth() {
        return this.zipService.getHealthStatus();
    }
    async getInfo() {
        return {
            name: 'Optimized Zip Microservice',
            version: '2.0.0',
            description: 'High-performance zip creation with worker threads and direct streaming',
            features: [
                'Single endpoint operation',
                'Worker thread processing',
                'Direct streaming',
                'Memory optimized',
                'Automatic file type conversion (HEIC→JPG, MOV→MP4)',
                'Parallel downloads',
                'Retry mechanism',
                'Large file support'
            ],
            supportedFileTypes: [
                'Images: jpg, png, gif, bmp, webp, heic',
                'Videos: mp4, mov, avi, mkv, webm',
                'Documents: pdf, doc, docx, txt, csv',
                'Archives: zip, rar, tar, gz',
                'And many more...'
            ],
            performance: {
                maxConcurrentFiles: 'Unlimited',
                processingMode: 'Parallel with worker threads',
                memoryUsage: 'Optimized streaming',
                responseTime: 'Immediate streaming start'
            }
        };
    }
};
exports.ZipController = ZipController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create and download zip file (Optimized with Threading)',
        description: `
    🚀 **OPTIMIZED SINGLE-ENDPOINT ZIP SERVICE**
    
    This enhanced endpoint creates and streams zip files directly with:
    - ✅ **Worker thread processing** for better performance
    - ✅ **Direct streaming response** (no intermediate storage)
    - ✅ **Memory-optimized** for large files
    - ✅ **Automatic retry mechanism** for failed downloads
    - ✅ **Support for all file types** including HEIC, MOV conversion
    - ✅ **Parallel processing** of multiple files
    
    **How it works:**
    1. Submit your request with file URLs and zip name
    2. Processing starts immediately in background worker thread
    3. Zip file streams directly to your browser for download
    4. No polling or status checking required!
    
    **Perfect for:**
    - Photo galleries and albums
    - Document collections  
    - Mixed media downloads
    - Any batch file download needs
    `
    }),
    (0, swagger_1.ApiBody)({
        type: zip_request_dto_1.ZipRequestDto,
        description: 'File URLs and desired zip filename',
        examples: {
            photoGallery: {
                summary: 'Photo Gallery',
                value: {
                    fileUrls: [
                        'https://cdn.fotosfolio.com/fotosfolioUser_f301238a-4df1-4047-bae3-7df9e7602a35/_67812103-a6f5-4d15-9c78-a895309735c1/sandesh_75554b06-7c51-4867-962b-e7db11cbe4e2/DSC03213_1749762059613.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&...',
                        'https://cdn.fotosfolio.com/fotosfolioUser_f301238a-4df1-4047-bae3-7df9e7602a35/_67812103-a6f5-4d15-9c78-a895309735c1/sandesh_75554b06-7c51-4867-962b-e7db11cbe4e2/DSC03451_1749762059646.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&...'
                    ],
                    zipFileName: 'my-photos.zip'
                }
            },
            mixedFiles: {
                summary: 'Mixed File Types',
                value: {
                    fileUrls: [
                        'https://example.com/document.pdf',
                        'https://example.com/image.heic',
                        'https://example.com/video.mov',
                        'https://example.com/photo.jpg'
                    ],
                    zipFileName: 'mixed-collection.zip'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '✅ Zip file created and streaming',
        headers: {
            'Content-Type': {
                description: 'application/zip',
                schema: { type: 'string' }
            },
            'Content-Disposition': {
                description: 'attachment; filename="your-file.zip"',
                schema: { type: 'string' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: '❌ Invalid request - empty URLs or invalid format',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 400 },
                message: {
                    type: 'string',
                    examples: [
                        'No file URLs provided',
                        'No valid URLs provided',
                        'Invalid URL format detected'
                    ]
                },
                error: { type: 'string', example: 'Bad Request' }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: 500,
        description: '❌ Server error during zip creation',
        schema: {
            type: 'object',
            properties: {
                error: { type: 'string', example: 'Failed to create zip file' },
                message: { type: 'string', example: 'Worker thread encountered an error' },
                jobId: { type: 'string', example: 'stream-12345678-1234-1234-1234-123456789012' }
            }
        }
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [zip_request_dto_1.ZipRequestDto, Object]),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "createZip", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, swagger_1.ApiOperation)({
        summary: 'Service health check',
        description: 'Get current service status and performance metrics'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Service health information',
        schema: {
            type: 'object',
            properties: {
                status: { type: 'string', example: 'healthy' },
                workers: {
                    type: 'object',
                    properties: {
                        active: { type: 'number', example: 2 },
                        total: { type: 'number', example: 4 },
                        queue: { type: 'number', example: 0 }
                    }
                },
                redis: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'connected' }
                    }
                },
                mode: { type: 'string', example: 'streaming' },
                features: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['worker-threads', 'direct-streaming', 'memory-optimized']
                },
                uptime: { type: 'string', example: '1d 5h 30m' },
                memoryUsage: {
                    type: 'object',
                    properties: {
                        rss: { type: 'string', example: '45.2 MB' },
                        heapTotal: { type: 'string', example: '28.1 MB' },
                        heapUsed: { type: 'string', example: '18.7 MB' },
                        external: { type: 'string', example: '1.2 MB' }
                    }
                }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('info'),
    (0, swagger_1.ApiOperation)({
        summary: 'API information',
        description: 'Get information about the zip service capabilities'
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'API information',
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Optimized Zip Microservice' },
                version: { type: 'string', example: '2.0.0' },
                description: { type: 'string', example: 'High-performance zip creation with worker threads' },
                features: {
                    type: 'array',
                    items: { type: 'string' },
                    example: [
                        'Single endpoint operation',
                        'Worker thread processing',
                        'Direct streaming',
                        'Memory optimized',
                        'Automatic file type conversion',
                        'Parallel downloads',
                        'Retry mechanism'
                    ]
                },
                supportedFileTypes: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['jpg', 'png', 'heic', 'mov', 'mp4', 'pdf, doc, docx, txt, csv', 'zip, rar, tar, gz', 'And many more...']
                }
            }
        }
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ZipController.prototype, "getInfo", null);
exports.ZipController = ZipController = __decorate([
    (0, swagger_1.ApiTags)('Zip'),
    (0, common_1.Controller)('zip'),
    __metadata("design:paramtypes", [zip_service_1.ZipService])
], ZipController);
//# sourceMappingURL=zip.controller.js.map