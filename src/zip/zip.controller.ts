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

@ApiTags('Zip Operations')
@Controller('zip')
export class ZipController {
  constructor(private readonly zipService: ZipService) { }

  @Post('create-job')
  @ApiOperation({
    summary: 'Create asynchronous zip job',
    description: 'Creates a background job to zip files from S3 presigned URLs. Returns job ID for tracking.'
  })
  @ApiBody({
    type: ZipRequestDto,
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
  })
  @ApiResponse({
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
  })
  @ApiResponse({
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
  })
  @ApiResponse({
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
  })
  async createZipJob(@Body() dto: ZipRequestDto) {
    if (!dto.fileUrls || dto.fileUrls.length === 0) {
      throw new HttpException('No file URLs provided', HttpStatus.BAD_REQUEST);
    }

    if (dto.fileUrls.length > 100) {
      throw new HttpException(
        'Maximum 100 files allowed per zip job',
        HttpStatus.PAYLOAD_TOO_LARGE
      );
    }

    const jobId = await this.zipService.createZipJob(dto);

    return {
      jobId,
      message: 'Zip job created successfully',
      estimatedTime: '2-5 minutes depending on file sizes'
    };
  }

  @Get('status/:jobId')
  @ApiOperation({
    summary: 'Get zip job status',
    description: 'Check the current status of a zip job. Use this to poll for completion.'
  })
  @ApiParam({
    name: 'jobId',
    description: 'Job ID returned from create-job endpoint',
    example: 'job-12345678-1234-1234-1234-123456789012'
  })
  @ApiResponse({
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
  })
  @ApiResponse({
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
  })
  async getJobStatus(@Param('jobId') jobId: string) {
    const status = await this.zipService.getJobStatus(jobId);

    if (status.status === 'not_found') {
      throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
    }

    return status;
  }

  @Get('download/:jobId')
  @ApiOperation({
    summary: 'Download completed zip file',
    description: 'Download the zip file once job is completed. File will be automatically deleted after download.'
  })
  @ApiParam({
    name: 'jobId',
    description: 'Job ID of completed zip job',
    example: 'job-12345678-1234-1234-1234-123456789012'
  })
  @ApiQuery({
    name: 'inline',
    required: false,
    description: 'Set to true to view file inline instead of download',
    example: false
  })
  @ApiResponse({
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
  })
  @ApiResponse({
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
  })
  @ApiResponse({
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
  })
  async downloadZip(
    @Param('jobId') jobId: string,
    @Res() res: Response,
    @Query('inline') inline?: boolean
  ) {
    await this.zipService.downloadZip(jobId, res, inline);
  }

  @Get('jobs')
  @ApiOperation({
    summary: 'List active zip jobs',
    description: 'Get list of all active jobs (pending, processing) for monitoring'
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter jobs by status',
    enum: ['pending', 'processing', 'completed', 'failed']
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of jobs to return',
    example: 20
  })
  @ApiResponse({
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
  })
  async listJobs(
    @Query('status') status?: string,
    @Query('limit') limit: number = 20
  ) {
    return await this.zipService.listJobs(status, limit);
  }

  @Post('cancel/:jobId')
  @ApiOperation({
    summary: 'Cancel a pending or processing zip job',
    description: 'Cancel a job that is still pending or processing'
  })
  @ApiParam({
    name: 'jobId',
    description: 'Job ID to cancel'
  })
  @ApiResponse({
    status: 200,
    description: 'Job cancelled successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Job cancelled successfully' },
        jobId: { type: 'string' }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Job not found'
  })
  @ApiResponse({
    status: 409,
    description: 'Job cannot be cancelled (already completed or failed)'
  })
  async cancelJob(@Param('jobId') jobId: string) {
    const result = await this.zipService.cancelJob(jobId);
    return result;
  }

  @Get('health')
  @ApiOperation({
    summary: 'Check service health',
    description: 'Health check endpoint for monitoring service status and worker threads'
  })
  @ApiResponse({
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
  })
  async healthCheck() {
    return await this.zipService.getHealthStatus();
  }
}