import {
  Injectable,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatahubService } from './datahub/datahub.service';
import { ZipQueueService } from './queue/zip-queue.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ZipRequestDto } from './dto/zip-request.dto';
import { Response } from 'express';
import {
  S3Client,
  HeadObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Redis from 'ioredis';
import archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';
import pLimit from 'p-limit';
import { Worker } from 'worker_threads';
import { cleanUpTempFiles } from './utils/temp-file-cleaner';

// Enhanced error handling function
function ensureError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return new Error(error.message);
  }
  if (typeof error === 'string') return new Error(error);
  return new Error(JSON.stringify(error, null, 2));
}

function toNodeReadable(readableStream: ReadableStream<Uint8Array>): Readable {
  const reader = readableStream.getReader();
  return new Readable({
    async read() {
      try {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
        } else {
          this.push(Buffer.from(value));
        }
      } catch (err) {
        this.destroy(err);
      }
    },
  });
}

@Injectable()
export class EnhancedZipService {
  private readonly logger = new Logger(EnhancedZipService.name);
  private readonly s3: S3Client;
  private readonly redis: Redis;
  private readonly tempDir: string;

  // Performance optimizations
  private readonly CONCURRENCY = parseInt(process.env.ZIP_CONCURRENCY || '10');
  private readonly CHUNK_SIZE = parseInt(process.env.ZIP_CHUNK_SIZE || '50');
  private readonly SMALL_SIZE = 200 * 1024 * 1024; // 200MB
  private readonly WORKER_POOL_SIZE = parseInt(process.env.WORKER_POOL_SIZE || '4');
  private readonly QUEUE_THRESHOLD = 1024 * 1024 * 1024; // 1GB - Use queue for files > 1GB

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => DatahubService))
    private readonly datahubService: DatahubService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: any,
    private readonly zipQueueService: ZipQueueService,
  ) {
    // Enhanced S3 client with connection pooling
    this.s3 = new S3Client({
      region: 'ap-south-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
      forcePathStyle: true,
      maxAttempts: 3,
    });

    // Redis connection with retry logic
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
    });

    this.tempDir = path.resolve(__dirname, '../../../tmp');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    // Set UV_THREADPOOL_SIZE for better performance
    process.env.UV_THREADPOOL_SIZE = (parseInt(process.env.UV_THREADPOOL_SIZE || '4') * 2).toString();

    // Clear any existing cache on startup
    this.clearStartupCache();
  }

  private async clearStartupCache(): Promise<void> {
    try {
      const keys = await this.redis.keys('zip:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.log(`Cleared ${keys.length} cached zip keys on startup`);
      }
    } catch (error) {
      this.logger.warn(`Failed to clear startup cache: ${error.message}`);
    }
  }

  async archiveAndStreamZip(dto: ZipRequestDto, res: Response, userId: string): Promise<void> {
    const { fileUrls, zipFileName } = dto;

    if (!fileUrls || fileUrls.length === 0) {
      res.status(400).json({ error: 'No file URLs provided' });
      return;
    }

    const jobId = `zip-${uuidv4()}`;
    const cacheKey = `zip:${userId}:${jobId}`;
    const metaCacheKey = `zip:meta:${userId}:${jobId}`;

    try {
      this.logger.log(`[${jobId}] Starting zip request for ${fileUrls.length} files`);

      // Try to get cached metadata first
      let files: any[] | null = null;
      try {
        const cachedMeta = await this.redis.get(metaCacheKey);
        if (cachedMeta) {
          files = JSON.parse(cachedMeta);
          this.logger.log(`[${jobId}] File metadata cache hit`);
        }
      } catch (cacheError) {
        this.logger.warn(`[${jobId}] Cache read failed: ${ensureError(cacheError).message}`);
      }

      if (!files) {
        files = await this.getFilesMetadata(fileUrls, jobId);
        try {
          await this.redis.set(metaCacheKey, JSON.stringify(files), 'EX', 60 * 60);
        } catch (cacheError) {
          this.logger.warn(`[${jobId}] Cache write failed: ${ensureError(cacheError).message}`);
        }
      }

      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      this.logger.log(`[${jobId}] Total size: ${this.formatFileSize(totalSize)}`);

      // Try to get cached presigned URL
      try {
        const cacheResult = await this.redis.get(cacheKey);
        if (cacheResult) {
          this.logger.log(`[${jobId}] Presigned URL cache hit`);
          res.json({ downloadUrl: cacheResult });
          return;
        }
      } catch (cacheError) {
        this.logger.warn(`[${jobId}] Cache read failed: ${ensureError(cacheError).message}`);
      }

      // Decision tree for processing strategy
      if (totalSize <= this.SMALL_SIZE) {
        // Small files: Sequential processing with streaming
        await this.zipAndStreamSmall(files, zipFileName, res, jobId);
      } else {
        // Large files: Use BullMQ for background processing
        await this.zipWithQueue(files, zipFileName, res, jobId, userId, cacheKey);
      }
    } catch (error) {
      const safeError = ensureError(error);
      this.logger.error(`[${jobId}] Error in archiveAndStreamZip: ${safeError.message}`, safeError.stack);

      if (!res.headersSent) {
        res.status(500).json({
          error: 'Failed to process zip request',
          message: safeError.message,
        });
      }
      return;
    }
  }

  private async getFilesMetadata(fileUrls: string[], jobId: string): Promise<any[]> {
    const results: any[] = [];
    const limit = pLimit(this.CONCURRENCY);

    await Promise.all(
      fileUrls.map(url =>
        limit(async () => {
          try {
            // Clean the URL and extract filename
            const cleanUrl = url.split('?')[0]; // Remove query parameters for filename extraction
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const originalName = pathname.split('/').pop() || 'unknown-file';

            // Use fetch with timeout instead of S3 SDK
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            try {
              // Try HEAD request first
              let response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal
              });

              // If HEAD fails, try GET with range
              if (!response.ok && response.status !== 405) {
                response = await fetch(url, {
                  method: 'GET',
                  headers: { 'Range': 'bytes=0-1' },
                  signal: controller.signal
                });
              }

              clearTimeout(timeoutId);

              if (response.ok) {
                let size = parseInt(response.headers.get('content-length') || '0', 10);

                // Handle range response
                const contentRange = response.headers.get('content-range');
                if (contentRange) {
                  const match = contentRange.match(/bytes \d+-\d+\/(\d+)/);
                  if (match) {
                    size = parseInt(match[1], 10);
                  }
                }

                // Default size if we can't determine it
                if (size === 0) {
                  size = 1024 * 1024; // Default to 1MB
                }

                results.push({
                  url, // Store the full URL
                  size,
                  originalName,
                  key: pathname.substring(1) // Remove leading slash for compatibility
                });

              } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }
            } catch (fetchError) {
              clearTimeout(timeoutId);
              throw fetchError;
            }
          } catch (error) {
            const safeError = ensureError(error);
            this.logger.warn(`[${jobId}] Failed to get metadata for ${url}: ${safeError.message}`);

            // Add a fallback entry with estimated size
            const urlObj = new URL(url);
            const originalName = urlObj.pathname.split('/').pop() || 'unknown-file';

            results.push({
              url,
              size: 5 * 1024 * 1024, // Estimate 5MB for failed requests
              originalName,
              key: urlObj.pathname.substring(1),
              isFallback: true
            });
          }
        })
      )
    );

    this.logger.log(`[${jobId}] Successfully processed ${results.length} files (${results.filter(r => !r.isFallback).length} with real metadata)`);

    if (results.length === 0) {
      throw new Error('No valid files found for zipping');
    }

    return results;
  }

  private extractKeyFromUrl(url: string): string {
    const parts = url.split('/');
    return parts.slice(4).join('/');
  }

  // Small files: Sequential processing with streaming
  private async zipAndStreamSmall(files: any[], zipFileName: string, res: Response, jobId: string): Promise<void> {
    try {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${zipFileName || 'archive.zip'}"`);
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Transfer-Encoding', 'chunked');

      const archive = archiver('zip', { zlib: { level: 1 } });

      archive.on('error', (err) => {
        const safeError = ensureError(err);
        this.logger.error(`[${jobId}] Archive error: ${safeError.message}`, safeError.stack);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Archive error', message: safeError.message });
        }
      });

      archive.pipe(res);

      // Sequential processing for small files
      for (const [index, file] of files.entries()) {
        try {
          this.logger.log(`[${jobId}] Processing file ${index + 1}/${files.length}: ${file.originalName}`);

          // Use fetch instead of S3 SDK
          const response = await fetch(file.url);

          if (!response.ok) {
            throw new Error(`Failed to fetch ${file.originalName}: HTTP ${response.status}`);
          }

          // Convert web stream to Node.js readable stream
          const nodeStream = Readable.fromWeb(response.body);

          archive.append(nodeStream, {
            name: file.originalName,
          });

          if ((index + 1) % 10 === 0) {
            this.logger.log(`[${jobId}] Processed ${index + 1}/${files.length} files`);
          }
        } catch (error) {
          const safeError = ensureError(error);
          this.logger.warn(`[${jobId}] Failed to append file ${file.originalName}: ${safeError.message}`);
        }
      }

      await archive.finalize();
      this.logger.log(`[${jobId}] Small zip streaming completed`);
    } catch (error) {
      const safeError = ensureError(error);
      this.logger.error(`[${jobId}] Error in zipAndStreamSmall: ${safeError.message}`, safeError.stack);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to create zip', message: safeError.message });
      }
      return;
    }
  }



  // Large files: Use BullMQ for background processing
  private async zipWithQueue(files: any[], zipFileName: string, res: Response, jobId: string, userId: string, cacheKey: string): Promise<void> {
    try {
      // Add job to queue
      const queueJobId = await this.zipQueueService.addZipJob({
        files,
        zipFileName,
        userId,
        jobId,
        s3Key: '', // Not needed for cache approach
      });

      // Return job status and download info
      res.json({
        message: 'Zip processing started',
        jobId,
        queueJobId,
        statusUrl: `/zip/status/${jobId}`,
        downloadUrl: `/zip/download/${jobId}`,
        totalFiles: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
        estimatedTime: 'Ready in 2-5 minutes'
      });

      this.logger.log(`[${jobId}] Large zip job queued successfully`);
    } catch (error) {
      const safeError = ensureError(error);
      this.logger.error(`[${jobId}] Error in zipWithQueue: ${safeError.message}`, safeError.stack);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Failed to queue zip job',
          message: safeError.message,
        });
      }
      return;
    }
  }


  private cleanUpTempFiles(filePaths: string[], jobId: string): void {
    filePaths.forEach(filePath => {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        this.logger.warn(`[${jobId}] Failed to cleanup ${filePath}: ${ensureError(error).message}`);
      }
    });
  }

  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}
