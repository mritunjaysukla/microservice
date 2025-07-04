import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import {
  S3Client,
} from '@aws-sdk/client-s3';
import Redis from 'ioredis';
import { ZipRequestDto } from './dto/zip-request.dto';
import { Response } from 'express';
import { Piscina } from 'piscina';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ZipService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ZipService.name);
  private redis: Redis;
  private piscina: Piscina;
  private s3Client: S3Client;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: () => 100,
      maxRetriesPerRequest: 3,
    });

    this.s3Client = new S3Client({
      region: process.env.S3_REGION || 'custom-region',
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
    });
  }

  onModuleInit() {
    // Initialize worker thread pool optimized for streaming
    const workerPath = path.resolve(__dirname, './workers/zip-worker.js');
    const tsWorkerPath = path.resolve(__dirname, './workers/zip-worker.ts');

    this.piscina = new Piscina({
      filename: fs.existsSync(workerPath) ? workerPath : tsWorkerPath,
      maxThreads: parseInt(process.env.ZIP_MAX_THREADS || '4'),
      minThreads: parseInt(process.env.ZIP_MIN_THREADS || '2'),
      idleTimeout: 60000, // 1 minute idle timeout for faster cleanup
      maxQueue: 50,
      execArgv: fs.existsSync(workerPath) ? [] : ['-r', 'ts-node/register'],
    });

    this.logger.log(`Worker pool initialized: ${this.piscina.threads.length} threads`);
  }

  onModuleDestroy() {
    this.redis.disconnect();
    if (this.piscina) {
      this.piscina.destroy();
    }
  }

  /**
   * Optimized single-endpoint zip creation and streaming
   * Combines threading performance with direct streaming response
   */
  async archiveAndStreamZip(dto: ZipRequestDto, res: Response) {
    const { fileUrls, zipFileName } = dto;

    if (!fileUrls || fileUrls.length === 0) {
      throw new Error('No file URLs provided');
    }

    // Validate URLs
    const validUrls = this.validateUrls(fileUrls);
    if (validUrls.length === 0) {
      throw new Error('No valid URLs provided');
    }

    const jobId = `stream-${uuidv4()}`;
    const finalZipName = zipFileName || 'archive.zip';

    this.logger.log(`Starting streaming zip job ${jobId} for ${validUrls.length} files`);

    // Set response headers immediately
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${finalZipName}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Transfer-Encoding', 'chunked');

    try {
      // Process zip creation in worker thread with optimized settings
      const result = await this.piscina.run({
        fileUrls: validUrls,
        zipFileName: finalZipName,
        jobId: jobId,
        streaming: true, // Flag for streaming optimization
        batchSize: 3, // Smaller batches for streaming
        maxRetries: 2, // Fewer retries for faster response
      });

      if (!result || !result.filePath || !fs.existsSync(result.filePath)) {
        throw new Error('Worker failed to create zip file');
      }

      this.logger.log(`Zip created successfully: ${result.filePath} (${this.formatFileSize(result.fileSize)})`);
      this.logger.log(`Processed ${result.successCount}/${validUrls.length} files successfully`);

      // Stream the file directly to response
      const stats = fs.statSync(result.filePath);
      res.setHeader('Content-Length', stats.size.toString());

      const readStream = fs.createReadStream(result.filePath, {
        highWaterMark: 64 * 1024 // 64KB chunks for optimal streaming
      });

      // Handle streaming errors
      readStream.on('error', (error) => {
        this.logger.error(`Stream error for job ${jobId}:`, error);
        if (!res.headersSent) {
          res.status(500).send('Error streaming zip file');
        }
        this.cleanupTempFile(result.filePath);
      });

      // Clean up temp file after streaming completes
      readStream.on('end', () => {
        this.logger.log(`Streaming completed for job ${jobId}`);
        this.cleanupTempFile(result.filePath);
      });

      // Start streaming
      readStream.pipe(res);

    } catch (error) {
      this.logger.error(`Error during zip creation for job ${jobId}:`, error);

      if (!res.headersSent) {
        res.status(500).json({
          error: 'Failed to create zip file',
          message: error.message,
          jobId: jobId
        });
      } else {
        // If headers are already sent, we can't change the status
        // The client will receive a partial/corrupted zip
        res.end();
      }
    }
  }

  /**
   * Enhanced URL validation for various formats
   */
  private validateUrls(urls: string[]): string[] {
    const validUrls: string[] = [];

    for (const url of urls) {
      try {
        const decodedUrl = decodeURIComponent(url);
        const parsedUrl = new URL(decodedUrl);

        // Check if it's a valid HTTP/HTTPS URL
        if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
          validUrls.push(url);
        } else {
          this.logger.warn(`Invalid protocol for URL: ${url}`);
        }
      } catch (error) {
        this.logger.warn(`Invalid URL format: ${url}`, error.message);
      }
    }

    this.logger.log(`Validated ${validUrls.length}/${urls.length} URLs`);
    return validUrls;
  }

  /**
   * Clean up temporary file
   */
  private cleanupTempFile(filePath: string) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) {
          this.logger.error(`Failed to delete temp file: ${filePath}`, err);
        } else {
          this.logger.log(`Cleaned up temp file: ${filePath}`);
        }
      });
    }
  }

  /**
   * Format file size for logging
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Get service health status
   */
  async getHealthStatus() {
    return {
      status: 'healthy',
      workers: {
        active: this.piscina.threads.length,
        total: this.piscina.options.maxThreads,
        queue: this.piscina.queueSize,
      },
      redis: {
        status: this.redis.status,
      },
      mode: 'streaming',
      features: ['worker-threads', 'direct-streaming', 'memory-optimized'],
      uptime: this.formatUptime(process.uptime()),
      memoryUsage: this.formatMemoryUsage(process.memoryUsage()),
    };
  }

  private formatUptime(uptime: number): string {
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  }

  private formatMemoryUsage(memUsage: NodeJS.MemoryUsage) {
    return {
      rss: this.formatFileSize(memUsage.rss),
      heapTotal: this.formatFileSize(memUsage.heapTotal),
      heapUsed: this.formatFileSize(memUsage.heapUsed),
      external: this.formatFileSize(memUsage.external),
    };
  }
}