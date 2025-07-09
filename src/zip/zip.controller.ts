// src/zip/zip.controller.ts

import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Logger,
  Get,
  Param,
  Headers,
} from '@nestjs/common';
import { Response } from 'express';
import { EnhancedZipService } from './enhanced-zip.service';
import { ZipQueueService } from './queue/zip-queue.service';
import { ZipRequestDto } from './dto/zip-request.dto';
import Redis from 'ioredis';

// Ensure proper error handling
function ensureError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return new Error(error.message);
  }
  if (typeof error === 'string') return new Error(error);
  return new Error(`Unknown error: ${JSON.stringify(error)}`);
}

@Controller('zip')
export class ZipController {
  private readonly logger = new Logger(ZipController.name);
  private redis: Redis;

  constructor(
    private readonly zipService: EnhancedZipService,
    private readonly zipQueueService: ZipQueueService
  ) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }

  @Post()
  async createZip(
    @Body() zipRequest: ZipRequestDto,
    @Res() res: Response,
    @Headers('user-id') userId: string = 'anonymous'
  ) {
    try {
      await this.zipService.archiveAndStreamZip(zipRequest, res, userId);
    } catch (error) {
      const safeError = ensureError(error);
      this.logger.error(`Controller error: ${safeError.message}`, safeError.stack);

      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Unhandled controller error',
          message: safeError.message,
        });
      }
    }
  }

  @Get('download/:jobId')
  async downloadZip(@Param('jobId') jobId: string, @Res() res: Response) {
    try {
      const fs = require('fs');

      // Get metadata
      const metaKey = `zip:meta:${jobId}`;
      const metaData = await this.redis.get(metaKey);

      if (!metaData) {
        return res.status(404).json({ error: 'Zip file not found or expired' });
      }

      const meta = JSON.parse(metaData);

      if (meta.status === 'failed') {
        return res.status(500).json({ error: 'Zip creation failed', message: meta.error });
      }

      if (meta.status !== 'completed') {
        return res.status(202).json({ status: meta.status, message: 'Zip is still processing' });
      }

      // Check if file exists
      if (!fs.existsSync(meta.filePath)) {
        return res.status(404).json({ error: 'Zip file has been cleaned up or expired' });
      }

      // Stream the file directly
      const fileName = meta.fileName || 'archive.zip';
      const fileSize = meta.size;

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Cache-Control', 'public, max-age=86400');

      // Stream the file
      const fileStream = fs.createReadStream(meta.filePath);
      fileStream.pipe(res);

      fileStream.on('error', (error) => {
        this.logger.error(`Error streaming file: ${error.message}`);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to stream zip file' });
        }
      });

    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({ error: 'Failed to download zip file' });
    }
  }

  @Get('status/:jobId')
  async getZipStatus(@Param('jobId') jobId: string) {
    try {
      // Check if zip is ready
      const cacheKey = `zip:download:${jobId}`;
      const exists = await this.redis.exists(cacheKey);

      if (exists) {
        const metaKey = `zip:meta:${jobId}`;
        const metaData = await this.redis.get(metaKey);

        if (metaData) {
          const meta = JSON.parse(metaData);
          return {
            status: meta.status,
            downloadUrl: meta.status === 'completed' ? `/zip/download/${jobId}` : null,
            fileName: meta.fileName,
            size: meta.size,
            createdAt: meta.createdAt,
            error: meta.error
          };
        }
      }

      // Check job status in queue
      const jobStatus = await this.zipQueueService.getJobStatus(jobId);
      return jobStatus;

    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
