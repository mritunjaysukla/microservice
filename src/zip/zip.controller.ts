import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpException,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ZipService } from './zip.service';
import { ZipRequestDto } from './dto/zip-request.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';

@ApiTags('Optimized Zip Operations')
@Controller('zip')
export class ZipController {
  constructor(private readonly zipService: ZipService) { }

  /**
   * SINGLE OPTIMIZED API - Zip and Download with Presigned URLs
   * This is the main endpoint that handles zip creation with unlimited size support
   */
  @Post('create')
  @ApiOperation({
    summary: 'Create optimized zip with presigned URL download',
    description: `
    🚀 **SINGLE OPTIMIZED API FOR ZIP & DOWNLOAD**
    
    This enhanced endpoint creates zip files from presigned S3 URLs with:
    - ✅ **Unlimited file size support** (no more size restrictions)
    - ✅ **Ultra-fast presigned URL downloads** (CDN-like performance)
    - ✅ **Background processing with worker threads** (non-blocking)
    - ✅ **Automatic retry mechanism** for failed downloads
    - ✅ **Real-time progress tracking** with detailed status
    - ✅ **Memory-efficient streaming** for large files
    - ✅ **24-hour download availability** (extended from 6 hours)
    
    **How it works:**
    1. Submit your request with presigned URLs
    2. Get a job ID immediately (202 response)
    3. Poll the status endpoint to track progress
    4. Download via high-speed presigned URL when ready
    
    **Perfect for:**
    - Large photo/video collections
    - Bulk file downloads
    - High-volume processing
    - Production applications requiring reliability
    `
  })
  @ApiBody({
    type: ZipRequestDto,
    description: 'Array of presigned S3 URLs and desired zip filename',
    examples: {
      smallBatch: {
        summary: 'Small batch (1-10 files)',
        value: {
          fileUrls: [
            'https://s3-endpoint.com/bucket/photo1.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&...',
            'https://s3-endpoint.com/bucket/photo2.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&...'
          ],
          zipFileName: 'my-photos.zip'
        }
      },
      largeBatch: {
        summary: 'Large batch (50+ files)',
        value: {
          fileUrls: [
            'https://s3-endpoint.com/bucket/video1.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&...',
            'https://s3-endpoint.com/bucket/video2.mov?X-Amz-Algorithm=AWS4-HMAC-SHA256&...',
            '...50+ more URLs...'
          ],
          zipFileName: 'large-video-collection.zip'
        }
      },
      mixedContent: {
        summary: 'Mixed content types',
        value: {
          fileUrls: [
            'https://s3-endpoint.com/bucket/document.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&...',
            'https://s3-endpoint.com/bucket/image.heic?X-Amz-Algorithm=AWS4-HMAC-SHA256&...',
            'https://s3-endpoint.com/bucket/video.mov?X-Amz-Algorithm=AWS4-HMAC-SHA256&...'
          ],
          zipFileName: 'mixed-content.zip'
        }
      }
    }
  })
  @ApiResponse({
    status: 202,
    description: '✅ Zip job created successfully - Processing started in background',
    schema: {
      type: 'object',
      properties: {
        jobId: {
          type: 'string',
          example: 'job-12345678-1234-1234-1234-123456789012',
          description: 'Unique job identifier for tracking'
        },
        status: {
          type: 'string',
          example: 'pending',
          description: 'Initial job status'
        },
        message: {
          type: 'string',
          example: 'Zip job created successfully with presigned URL support'
        },
        estimatedTime: {
          type: 'string',
          example: '2-5 minutes',
          description: 'Estimated processing time based on file count'
        },
        downloadInfo: {
          type: 'object',
          properties: {
            pollUrl: {
              type: 'string',
              example: '/zip/status/job-12345678-1234-1234-1234-123456789012',
              description: 'URL to check job status and get download link'
            },
            directDownloadNote: {
              type: 'string',
              example: 'Once completed, you will receive a presigned URL for direct download'
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '❌ Invalid request - empty file URLs or invalid data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { 
          type: 'string', 
          examples: [
            'No file URLs provided',
            'Invalid presigned URL format',
            'File URLs must be presigned S3 URLs'
          ]
        },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  @ApiResponse({
    status: 413,
    description: '❌ Too many files - exceeds maximum limit',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 413 },
        message: { type: 'string', example: 'Maximum 500 files allowed per zip job for optimal performance' },
        error: { type: 'string', example: 'Payload Too Large' }
      }
    }
  })
  @ApiResponse({
    status: 503,
    description: '⏳ Server busy - too many active jobs',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 503 },
        message: { type: 'string', example: 'Server is busy processing other jobs. Please try again in a few minutes.' },
        error: { type: 'string', example: 'Service Unavailable' }
      }
    }
  })
  async createOptimizedZip(@Body() dto: ZipRequestDto) {
    // Enhanced validation
    if (!dto.fileUrls || dto.fileUrls.length === 0) {
      throw new HttpException(
        'No file URLs provided. Please include at least one presigned S3 URL.', 
        HttpStatus.BAD_REQUEST
      );
    }

    // Validate URLs are presigned
    const invalidUrls = dto.fileUrls.filter(url => {
      try {
        const parsedUrl = new URL(decodeURIComponent(url));
        // Check for presigned URL indicators
        const hasPresignedParams = parsedUrl.searchParams.has('X-Amz-Algorithm') || 
                                  parsedUrl.searchParams.has('Signature') ||
                                  parsedUrl.searchParams.size > 2;
        return !hasPresignedParams;
      } catch {
        return true;
      }
    });

    if (invalidUrls.length > 0) {
      throw new HttpException(
        `${invalidUrls.length} invalid or non-presigned URLs detected. All URLs must be valid presigned S3 URLs.`,
        HttpStatus.BAD_REQUEST
      );
    }

    // Create optimized zip job
    const result = await this.zipService.createZipWithPresignedUrl(dto);

    return {
      ...result,
      performance: {
        maxConcurrentJobs: 15,
        supportedFileTypes: ['images', 'videos', 'documents', 'archives'],
        features: [
          'unlimited-size-support',
          'presigned-url-downloads',
          'background-processing',
          'retry-mechanism',
          'progress-tracking'
        ]
      }
    };
  }

  /**
   * ENHANCED STATUS ENDPOINT - Get job status with presigned URL
   */
  @Get('status/:jobId')
  @ApiOperation({
    summary: 'Get job status with presigned download URL',
    description: `
    📊 **ENHANCED STATUS TRACKING**
    
    Get real-time status of your zip job including:
    - Current processing stage
    - Files processed vs total
    - Processing speed and ETA
    - **Direct presigned download URL** when ready
    - Detailed error information if failed
    
    **Status Flow:**
    1. \`pending\` → Job queued for processing
    2. \`processing\` → Files being downloaded and zipped
    3. \`completed\` → ✅ Ready for download with presigned URL
    4. \`failed\` → ❌ Error occurred (may be partial success)
    `
  })
  @ApiParam({
    name: 'jobId',
    description: 'Job ID returned from create endpoint',
    example: 'job-12345678-1234-1234-1234-123456789012'
  })
  @ApiResponse({
    status: 200,
    description: 'Job status retrieved successfully',
    schema: {
      oneOf: [
        {
          title: '⏳ Pending Job',
          type: 'object',
          properties: {
            status: { type: 'string', example: 'pending' },
            message: { type: 'string', example: 'Job is queued for processing' },
            fileCount: { type: 'number', example: 25 },
            createdAt: { type: 'string', example: '1640995200000' }
          }
        },
        {
          title: '🔄 Processing Job',
          type: 'object',
          properties: {
            status: { type: 'string', example: 'processing' },
            message: { type: 'string', example: 'Files are being zipped and uploaded to cloud storage' },
            progress: { type: 'string', example: '60% complete (15/25 files)' },
            processedFiles: { type: 'number', example: 15 },
            fileCount: { type: 'number', example: 25 }
          }
        },
        {
          title: '✅ Completed Job',
          type: 'object',
          properties: {
            status: { type: 'string', example: 'completed' },
            message: { type: 'string', example: 'Zip file ready for download via presigned URL' },
            presignedUrl: { 
              type: 'string', 
              example: 'https://s3-endpoint.com/bucket/zips/archive.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&...',
              description: '🚀 HIGH-SPEED PRESIGNED DOWNLOAD URL'
            },
            downloadMethod: { type: 'string', example: 'presigned_url' },
            fileSize: { type: 'string', example: '125.7 MB' },
            successCount: { type: 'number', example: 24 },
            fileCount: { type: 'number', example: 25 },
            expiresAt: { type: 'string', example: '1641081600000' }
          }
        },
        {
          title: '❌ Failed Job',
          type: 'object',
          properties: {
            status: { type: 'string', example: 'failed' },
            error: { type: 'string', example: 'Some files were inaccessible' },
            message: { type: 'string', example: 'Partially completed: 20 files processed before failure' },
            partialSuccess: { type: 'boolean', example: true },
            successCount: { type: 'number', example: 20 },
            fileCount: { type: 'number', example: 25 }
          }
        }
      ]
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found or expired',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Job not found or has expired' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  async getEnhancedStatus(@Param('jobId') jobId: string) {
    const status = await this.zipService.getJobStatus(jobId);

    if (status.status === 'not_found') {
      throw new HttpException(
        'Job not found. It may have expired or never existed.', 
        HttpStatus.NOT_FOUND
      );
    }

    // Add helpful metadata
    const enhancedStatus = {
      ...status,
      metadata: {
        jobId,
        lastUpdated: new Date().toISOString(),
        downloadInstructions: status.status === 'completed' && status.presignedUrl 
          ? 'Use the presignedUrl for immediate download. No authentication required.'
          : 'Check back in a few moments for download link.',
        retentionPolicy: '24 hours from completion'
      }
    };

    return enhancedStatus;
  }

  /**
   * LEGACY DOWNLOAD ENDPOINT (Fallback)
   * Automatically redirects to presigned URL if available
   */
  @Get('download/:jobId')
  @ApiOperation({
    summary: 'Legacy download endpoint (redirects to presigned URL)',
    description: `
    🔄 **LEGACY DOWNLOAD SUPPORT**
    
    This endpoint automatically redirects to the high-speed presigned URL when available.
    For best performance, use the presigned URL directly from the status endpoint.
    `
  })
  @ApiParam({
    name: 'jobId',
    description: 'Job ID of completed zip job'
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to presigned URL for optimal download speed',
    headers: {
      'Location': {
        description: 'Presigned URL for direct download',
        schema: { type: 'string' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Zip file not found or not ready'
  })
  async legacyDownload(
    @Param('jobId') jobId: string,
    @Res() res: Response,
    @Query('inline') inline?: boolean
  ) {
    await this.zipService.downloadZip(jobId, res, inline);
  }

  /**
   * SERVICE HEALTH AND METRICS
   */
  @Get('health')
  @ApiOperation({
    summary: 'Advanced service health check',
    description: `
    🏥 **COMPREHENSIVE HEALTH MONITORING**
    
    Get detailed insights into service performance:
    - Worker thread utilization
    - Redis connection status
    - S3 integration status
    - Memory and CPU usage
    - Active job statistics
    `
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed service health information',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        workers: {
          type: 'object',
          properties: {
            active: { type: 'number', example: 4 },
            total: { type: 'number', example: 6 },
            queue: { type: 'number', example: 2 }
          }
        },
        redis: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'connected' },
            activeJobs: { type: 'number', example: 3 },
            memory: { type: 'string', example: '15.2MB' }
          }
        },
        s3: {
          type: 'object',
          properties: {
            endpoint: { type: 'string', example: 'https://s3-endpoint.com' },
            bucket: { type: 'string', example: 'my-bucket' }
          }
        },
        performance: {
          type: 'object',
          properties: {
            uptime: { type: 'string', example: '2d 14h 32m' },
            nodeVersion: { type: 'string', example: 'v18.17.0' },
            memoryUsage: {
              type: 'object',
              properties: {
                rss: { type: 'string', example: '89.2 MB' },
                heapTotal: { type: 'string', example: '45.8 MB' },
                heapUsed: { type: 'string', example: '32.1 MB' }
              }
            }
          }
        }
      }
    }
  })
  async getAdvancedHealth() {
    const health = await this.zipService.getHealthStatus();
    
    return {
      ...health,
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      features: {
        unlimitedSize: true,
        presignedUrls: true,
        backgroundProcessing: true,
        retryMechanism: true,
        progressTracking: true,
        enhancedLogging: true
      }
    };
  }

  /**
   * QUICK API INFO
   */
  @Get('info')
  @ApiOperation({
    summary: 'API information and usage guide',
    description: 'Get quick information about API capabilities and usage'
  })
  @ApiResponse({
    status: 200,
    description: 'API information',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Optimized Zip Microservice' },
        version: { type: 'string', example: '2.0.0' },
        description: { type: 'string', example: 'High-performance zip creation with presigned URL downloads' }
      }
    }
  })
  async getApiInfo() {
    return {
      name: 'Optimized Zip Microservice',
      version: '2.0.0',
      description: 'High-performance zip creation with presigned URL downloads',
      capabilities: {
        maxFiles: 500,
        maxFileSize: 'Unlimited',
        downloadMethod: 'Presigned URLs',
        processingType: 'Background with Worker Threads',
        retentionPeriod: '24 hours',
        supportedFormats: ['All file types via presigned URLs']
      },
      endpoints: {
        create: 'POST /zip/create - Main endpoint for zip creation',
        status: 'GET /zip/status/:jobId - Check job status and get download URL',
        download: 'GET /zip/download/:jobId - Legacy download (redirects to presigned URL)',
        health: 'GET /zip/health - Service health monitoring',
        info: 'GET /zip/info - This endpoint'
      },
      quickStart: {
        step1: 'POST /zip/create with array of presigned URLs',
        step2: 'Get jobId from response',
        step3: 'Poll GET /zip/status/:jobId until status is "completed"',
        step4: 'Use presignedUrl from status response for direct download'
      }
    };
  }
}