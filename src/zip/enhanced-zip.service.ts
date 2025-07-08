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
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
      maxAttempts: 3,
    });

    // Redis connection with retry logic
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
    });

    this.tempDir = path.resolve(__dirname, '../../../tmp');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }

    // Set UV_THREADPOOL_SIZE for better performance
    process.env.UV_THREADPOOL_SIZE = (parseInt(process.env.UV_THREADPOOL_SIZE || '4') * 2).toString();
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
      } else if (totalSize <= this.QUEUE_THRESHOLD) {
        // Medium files: Parallel processing with worker threads
        await this.zipLargeWithWorkers(files, zipFileName, res, jobId, userId, cacheKey);
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
            const key = this.extractKeyFromUrl(url);
            const head = await this.s3.send(
              new HeadObjectCommand({
                Bucket: process.env.S3_BUCKET_NAME!,
                Key: key,
              }),
            );
            results.push({
              key,
              size: head.ContentLength || 0,
              originalName: path.basename(key),
            });
          } catch (error) {
            const safeError = ensureError(error);
            this.logger.warn(`[${jobId}] Failed to get metadata for ${url}: ${safeError.message}`);
          }
        })
      )
    );

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
          this.logger.log(`[${jobId}] Processing file ${index + 1}/${files.length}: ${file.key}`);

          const s3Obj = await this.s3.send(
            new GetObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME!,
              Key: file.key,
            }),
          );

          const nodeStream = toNodeReadable(s3Obj.Body as ReadableStream<Uint8Array>);
          archive.append(nodeStream, {
            name: file.originalName || path.basename(file.key),
          });

          if ((index + 1) % 10 === 0) {
            this.logger.log(`[${jobId}] Processed ${index + 1}/${files.length} files`);
          }
        } catch (error) {
          const safeError = ensureError(error);
          this.logger.warn(`[${jobId}] Failed to append file ${file.key}: ${safeError.message}`);
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

  // Medium files: Parallel processing with worker threads
  private async zipLargeWithWorkers(files: any[], zipFileName: string, res: Response, jobId: string, userId: string, cacheKey: string): Promise<void> {
    try {
      // Split files into chunks for parallel processing
      const chunks: any[][] = [];
      for (let i = 0; i < files.length; i += this.CHUNK_SIZE) {
        chunks.push(files.slice(i, i + this.CHUNK_SIZE));
      }

      this.logger.log(`[${jobId}] Processing ${chunks.length} chunks with worker threads`);

      // Process chunks in parallel using worker threads
      const tempZipPaths: string[] = await Promise.all(
        chunks.map((chunk, idx) =>
          this.createChunkZipWithWorker(chunk, `${jobId}-chunk${idx}.zip`, jobId)
        )
      );

      // Merge all chunk zips into final zip
      const finalZipPath = path.join(this.tempDir, `${jobId}-final.zip`);
      await this.mergeZips(tempZipPaths, finalZipPath, jobId);

      // Upload to S3
      const s3Key = `zips/${userId}/${jobId}/${zipFileName || 'archive.zip'}`;
      await this.uploadToS3(finalZipPath, s3Key, jobId);

      // Generate presigned URL
      const presignedUrl = await getSignedUrl(
        this.s3,
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: s3Key,
        }),
        { expiresIn: 60 * 60 * 24 }, // 24 hours
      );

      // Cache the result
      try {
        await this.redis.set(cacheKey, presignedUrl, 'EX', 60 * 60 * 23); // Cache for 23 hours
      } catch (cacheError) {
        this.logger.warn(`[${jobId}] Cache write failed: ${ensureError(cacheError).message}`);
      }

      res.json({
        downloadUrl: presignedUrl,
        jobId,
        totalFiles: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
      });

      // Cleanup temp files
      setTimeout(() => {
        this.cleanupTempFiles([...tempZipPaths, finalZipPath], jobId);
      }, 5000);

    } catch (error) {
      const safeError = ensureError(error);
      this.logger.error(`[${jobId}] Error in zipLargeWithWorkers: ${safeError.message}`, safeError.stack);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Failed to create large zip',
          message: safeError.message,
        });
      }
      return;
    }
  }

  // Large files: Use BullMQ for background processing
  private async zipWithQueue(files: any[], zipFileName: string, res: Response, jobId: string, userId: string, cacheKey: string): Promise<void> {
    try {
      const s3Key = `zips/${userId}/${jobId}/${zipFileName || 'archive.zip'}`;

      // Add job to queue
      await this.zipQueueService.addZipJob({
        files,
        zipFileName,
        userId,
        jobId,
        s3Key,
      });

      // Return job status endpoint
      res.json({
        message: 'Zip processing started',
        jobId,
        statusUrl: `/zip/status/${jobId}`,
        totalFiles: files.length,
        totalSize: files.reduce((sum, file) => sum + file.size, 0),
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

  private async createChunkZipWithWorker(files: any[], zipName: string, jobId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const tempPath = path.join(this.tempDir, zipName);
      const workerPath = path.join(__dirname, 'workers', 'enhanced-zip-worker.js');

      const worker = new Worker(workerPath, {
        workerData: {
          files,
          tempZipPath: tempPath,
          s3Config: {
            region: process.env.S3_REGION,
            endpoint: process.env.S3_ENDPOINT,
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY!,
              secretAccessKey: process.env.S3_SECRET_KEY!,
            },
          },
          bucketName: process.env.S3_BUCKET_NAME!,
          jobId,
          maxConcurrentDownloads: this.CONCURRENCY,
        },
      });

      worker.on('message', (message) => {
        if (message.type === 'success') {
          resolve(tempPath);
        } else if (message.type === 'error') {
          reject(new Error(message.message));
        } else if (message.type === 'progress') {
          this.logger.log(`[${jobId}] Worker progress: ${message.processed}/${message.total}`);
        }
      });

      worker.on('error', (error) => {
        reject(ensureError(error));
      });

      worker.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    });
  }

  private async mergeZips(zipPaths: string[], finalZipPath: string, jobId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(finalZipPath);
      const archive = archiver('zip', { zlib: { level: 1 } });

      output.on('close', () => {
        this.logger.log(`[${jobId}] Merged zip created: ${this.formatFileSize(archive.pointer())}`);
        resolve();
      });

      archive.on('error', (err) => {
        reject(ensureError(err));
      });

      archive.pipe(output);

      zipPaths.forEach((zipPath, index) => {
        if (fs.existsSync(zipPath)) {
          archive.append(fs.createReadStream(zipPath), { name: `chunk-${index}.zip` });
        }
      });

      archive.finalize();
    });
  }

  private async uploadToS3(filePath: string, key: string, jobId: string): Promise<void> {
    try {
      const fileStream = fs.createReadStream(filePath);
      const fileStats = fs.statSync(filePath);

      this.logger.log(`[${jobId}] Uploading ${this.formatFileSize(fileStats.size)} to S3`);

      await this.s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: key,
          Body: fileStream,
          ContentType: 'application/zip',
        }),
      );

      this.logger.log(`[${jobId}] Upload to S3 completed`);
    } catch (error) {
      const safeError = ensureError(error);
      this.logger.error(`[${jobId}] Upload to S3 failed: ${safeError.message}`);
      throw safeError;
    }
  }

  private cleanupTempFiles(filePaths: string[], jobId: string): void {
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
