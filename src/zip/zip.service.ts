import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
  private readonly JOB_PREFIX = 'zipjob:';
  private readonly ACTIVE_JOBS_KEY = 'zip:active_jobs';
  private readonly MAX_CONCURRENT_JOBS = 15;
  private readonly ZIP_EXPIRY_HOURS = 24; // Extended to 24 hours
  private readonly PRESIGNED_URL_EXPIRY = 3600; // 1 hour

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: () => 100,
      maxRetriesPerRequest: 3,
    });

    // Initialize S3 client for presigned URLs
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
    // Initialize worker thread pool with optimal settings for large files
    const workerPath = path.resolve(__dirname, './workers/zip-worker.js');
    const tsWorkerPath = path.resolve(__dirname, './workers/zip-worker.ts');

    this.piscina = new Piscina({
      filename: fs.existsSync(workerPath) ? workerPath : tsWorkerPath,
      maxThreads: parseInt(process.env.ZIP_MAX_THREADS || '6'), // Increased for better performance
      minThreads: parseInt(process.env.ZIP_MIN_THREADS || '2'),
      idleTimeout: 120000, // 2 minutes idle timeout
      maxQueue: 100, // Increased queue size
      execArgv: fs.existsSync(workerPath) ? [] : ['-r', 'ts-node/register'],
    });

    this.logger.log(`Worker pool initialized: ${this.piscina.threads.length} threads`);
    this.logger.log(`Using worker file: ${fs.existsSync(workerPath) ? workerPath : tsWorkerPath}`);
  }

  onModuleDestroy() {
    this.redis.disconnect();
    if (this.piscina) {
      this.piscina.destroy();
    }
  }

  /**
   * Single optimized API for zip creation and presigned URL generation
   */
  async createZipWithPresignedUrl(dto: ZipRequestDto): Promise<{
    jobId: string;
    status: string;
    message: string;
    estimatedTime: string;
    downloadInfo: {
      pollUrl: string;
      directDownloadNote: string;
    }
  }> {
    if (!dto.fileUrls || dto.fileUrls.length === 0) {
      throw new HttpException('No file URLs provided', HttpStatus.BAD_REQUEST);
    }

    // Remove file count limit for unlimited size support
    if (dto.fileUrls.length > 500) {
      throw new HttpException(
        'Maximum 500 files allowed per zip job for optimal performance',
        HttpStatus.PAYLOAD_TOO_LARGE
      );
    }

    // Check active jobs limit with higher threshold
    const activeJobs = await this.redis.scard(this.ACTIVE_JOBS_KEY);
    if (activeJobs >= this.MAX_CONCURRENT_JOBS) {
      throw new HttpException(
        'Server is busy processing other jobs. Please try again in a few minutes.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    const jobId = `job-${uuidv4()}`;
    const now = Date.now();
    const expiresAt = now + (this.ZIP_EXPIRY_HOURS * 60 * 60 * 1000);

    // Store job metadata with enhanced tracking
    await this.redis.hmset(this.JOB_PREFIX + jobId, {
      status: 'pending',
      zipFileName: dto.zipFileName || `archive-${Date.now()}.zip`,
      error: '',
      fileUrls: JSON.stringify(dto.fileUrls),
      createdAt: now.toString(),
      expiresAt: expiresAt.toString(),
      fileCount: dto.fileUrls.length.toString(),
      progress: '0',
      processedFiles: '0',
      uploadToS3: 'true', // Flag to indicate S3 upload
    });

    // Add to active jobs set
    await this.redis.sadd(this.ACTIVE_JOBS_KEY, jobId);

    // Set expiration for job data
    await this.redis.expire(this.JOB_PREFIX + jobId, this.ZIP_EXPIRY_HOURS * 3600);

    // Start processing job in background
    this.processOptimizedZipJob(jobId, dto).catch((err) => {
      this.logger.error(`Zip job ${jobId} failed:`, err);
      this.updateJobStatus(jobId, 'failed', err.message);
    });

    return {
      jobId,
      status: 'pending',
      message: 'Zip job created successfully with presigned URL support',
      estimatedTime: this.calculateEstimatedTime(dto.fileUrls.length),
      downloadInfo: {
        pollUrl: `/zip/status/${jobId}`,
        directDownloadNote: 'Once completed, you will receive a presigned URL for direct download'
      }
    };
  }

  /**
   * Optimized job processing with S3 upload and presigned URL generation
   */
  private async processOptimizedZipJob(jobId: string, dto: ZipRequestDto) {
    try {
      await this.updateJobStatus(jobId, 'processing');

      // Validate presigned URLs before processing
      const validUrls = await this.validatePresignedUrls(dto.fileUrls);

      if (validUrls.length === 0) {
        throw new Error('No valid presigned URLs found');
      }

      if (validUrls.length < dto.fileUrls.length) {
        this.logger.warn(`${dto.fileUrls.length - validUrls.length} URLs were invalid and skipped`);
        await this.redis.hset(this.JOB_PREFIX + jobId, 'validFileCount', validUrls.length.toString());
      }

      // Update progress tracking
      await this.redis.hset(this.JOB_PREFIX + jobId, 'totalFiles', validUrls.length.toString());

      // Execute optimized zip creation in worker thread
      const result = await this.piscina.run({
        fileUrls: validUrls,
        zipFileName: dto.zipFileName,
        jobId: jobId,
        s3Config: {
          region: process.env.S3_REGION,
          endpoint: process.env.S3_ENDPOINT,
          accessKeyId: process.env.S3_ACCESS_KEY,
          secretAccessKey: process.env.S3_SECRET_KEY,
          bucketName: process.env.S3_BUCKET_NAME,
        }
      });

      // Upload zip file to S3 for presigned URL access
      const s3Key = await this.uploadZipToS3(result.filePath, dto.zipFileName || `archive-${jobId}.zip`);

      // Generate presigned URL for download
      const presignedUrl = await this.generatePresignedDownloadUrl(s3Key);

      // Update job with completion data including presigned URL
      await this.redis.hmset(this.JOB_PREFIX + jobId, {
        status: 'completed',
        tempFilePath: result.filePath,
        s3Key: s3Key,
        presignedUrl: presignedUrl,
        fileSize: result.fileSize?.toString() || '0',
        successCount: result.successCount?.toString() || '0',
        completedAt: Date.now().toString(),
        downloadMethod: 'presigned_url'
      });

      // Clean up local temp file since we have it in S3
      this.cleanupTempFile(result.filePath);

    } catch (error) {
      await this.updateJobStatus(jobId, 'failed', error.message);
      throw error;
    } finally {
      // Remove from active jobs
      await this.redis.srem(this.ACTIVE_JOBS_KEY, jobId);
    }
  }

  /**
   * Upload zip file to S3 for presigned URL access
   */
  private async uploadZipToS3(filePath: string, fileName: string): Promise<string> {
    const s3Key = `zips/${Date.now()}-${fileName}`;
    
    try {
      const fileStream = fs.createReadStream(filePath);
      const stats = fs.statSync(filePath);

      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
        Body: fileStream,
        ContentType: 'application/zip',
        ContentLength: stats.size,
        Metadata: {
          'original-filename': fileName,
          'created-at': new Date().toISOString(),
        }
      });

      await this.s3Client.send(uploadCommand);
      this.logger.log(`Zip file uploaded to S3: ${s3Key}`);
      
      return s3Key;
    } catch (error) {
      this.logger.error(`Failed to upload zip to S3: ${error.message}`);
      throw new Error('Failed to upload zip file to cloud storage');
    }
  }

  /**
   * Generate presigned URL for zip download
   */
  private async generatePresignedDownloadUrl(s3Key: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
        ResponseContentDisposition: 'attachment'
      });

      const presignedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn: this.PRESIGNED_URL_EXPIRY
      });

      // Cache the presigned URL in Redis
      const cacheKey = `presigned-zip:${s3Key}`;
      await this.redis.setex(cacheKey, this.PRESIGNED_URL_EXPIRY - 60, presignedUrl);

      return presignedUrl;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${error.message}`);
      throw new Error('Failed to generate download URL');
    }
  }

  /**
   * Enhanced job status with presigned URL support
   */
  async getJobStatus(jobId: string): Promise<{
    status: string;
    error?: string;
    presignedUrl?: string;
    downloadUrl?: string;
    progress?: string;
    fileSize?: string;
    fileCount?: number;
    successCount?: number;
    processedFiles?: number;
    createdAt?: string;
    expiresAt?: string;
    message?: string;
    downloadMethod?: string;
  }> {
    const jobKey = this.JOB_PREFIX + jobId;
    const job = await this.redis.hgetall(jobKey);

    if (!job || Object.keys(job).length === 0) {
      return { status: 'not_found' };
    }

    const result: any = {
      status: job.status,
      fileCount: parseInt(job.fileCount || '0'),
      processedFiles: parseInt(job.processedFiles || '0'),
      createdAt: job.createdAt,
      expiresAt: job.expiresAt,
    };

    switch (job.status) {
      case 'pending':
        result.message = 'Job is queued for processing';
        break;
      case 'processing':
        const processed = parseInt(job.processedFiles || '0');
        const total = parseInt(job.totalFiles || job.fileCount || '0');
        const progressPercent = total > 0 ? Math.round((processed / total) * 100) : 0;
        result.message = 'Files are being zipped and uploaded to cloud storage';
        result.progress = `${progressPercent}% complete (${processed}/${total} files)`;
        break;
      case 'completed':
        // Always provide presigned URL for completed jobs
        if (job.presignedUrl) {
          result.presignedUrl = job.presignedUrl;
          result.downloadMethod = 'presigned_url';
          result.message = 'Zip file ready for download via presigned URL';
        } else {
          // Fallback to direct download if presigned URL is not available
          result.downloadUrl = `/zip/download/${jobId}`;
          result.downloadMethod = 'direct';
          result.message = 'Zip file ready for direct download';
        }
        result.fileSize = this.formatFileSize(parseInt(job.fileSize || '0'));
        result.successCount = parseInt(job.successCount || '0');
        break;
      case 'failed':
        result.error = job.error;
        result.successCount = parseInt(job.successCount || '0');
        result.partialSuccess = result.successCount > 0;
        result.message = result.partialSuccess 
          ? `Partially completed: ${result.successCount} files processed before failure`
          : 'Job failed to process any files';
        break;
    }

    return result;
  }

  /**
   * Enhanced validation for presigned URLs
   */
  private async validatePresignedUrls(urls: string[]): Promise<string[]> {
    const validUrls: string[] = [];
    const urlCheckPromises = urls.map(async (url) => {
      try {
        const decodedUrl = decodeURIComponent(url);
        const parsedUrl = new URL(decodedUrl);

        // Enhanced validation for presigned URLs
        const hasRequiredParams = parsedUrl.searchParams.has('X-Amz-Algorithm') || 
                                 parsedUrl.searchParams.has('Signature') ||
                                 parsedUrl.searchParams.size > 0;

        if (hasRequiredParams && (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:')) {
          return url;
        }
        return null;
      } catch (err) {
        this.logger.warn(`Invalid URL format: ${url}`);
        return null;
      }
    });

    const results = await Promise.all(urlCheckPromises);
    return results.filter(url => url !== null) as string[];
  }

  /**
   * Calculate estimated processing time based on file count
   */
  private calculateEstimatedTime(fileCount: number): string {
    if (fileCount <= 10) return '1-2 minutes';
    if (fileCount <= 50) return '2-5 minutes';
    if (fileCount <= 100) return '5-10 minutes';
    if (fileCount <= 200) return '10-15 minutes';
    return '15-30 minutes';
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
   * Legacy download method (fallback)
   */
  async downloadZip(jobId: string, res: Response, inline: boolean = false) {
    const jobKey = this.JOB_PREFIX + jobId;
    const job = await this.redis.hgetall(jobKey);

    if (!job || job.status !== 'completed') {
      throw new HttpException(
        'Zip file not found or not ready. Please use the presigned URL for download.',
        HttpStatus.NOT_FOUND
      );
    }

    // If presigned URL is available, redirect to it
    if (job.presignedUrl) {
      res.redirect(302, job.presignedUrl);
      return;
    }

    // Fallback to direct download if available
    if (job.tempFilePath && fs.existsSync(job.tempFilePath)) {
      const stats = fs.statSync(job.tempFilePath);
      const disposition = inline ? 'inline' : 'attachment';

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Length', stats.size.toString());
      res.setHeader('Content-Disposition', `${disposition}; filename="${job.zipFileName || 'archive.zip'}"`);
      res.setHeader('Cache-Control', 'no-cache');

      const readStream = fs.createReadStream(job.tempFilePath);
      readStream.pipe(res);

      readStream.on('end', () => {
        this.cleanupTempFile(job.tempFilePath);
      });
    } else {
      throw new HttpException(
        'Zip file has expired. Please create a new job.',
        HttpStatus.GONE
      );
    }
  }

  /**
   * Get service health status with enhanced metrics
   */
  async getHealthStatus() {
    const activeJobs = await this.redis.scard(this.ACTIVE_JOBS_KEY);
    const redisInfo = await this.redis.info('memory');
    
    return {
      status: 'healthy',
      workers: {
        active: this.piscina.threads.length,
        total: this.piscina.options.maxThreads,
        queue: this.piscina.queueSize,
      },
      redis: {
        status: this.redis.status,
        activeJobs,
        memory: this.extractRedisMemoryUsage(redisInfo),
      },
      s3: {
        endpoint: process.env.S3_ENDPOINT,
        bucket: process.env.S3_BUCKET_NAME,
      },
      performance: {
        uptime: this.formatUptime(process.uptime()),
        nodeVersion: process.version,
        memoryUsage: this.formatMemoryUsage(process.memoryUsage()),
      },
    };
  }

  /**
   * Helper methods
   */
  private async updateJobStatus(jobId: string, status: string, error?: string) {
    const updates: any = { status };
    if (error) updates.error = error;
    if (status === 'processing') updates.startedAt = Date.now().toString();
    
    await this.redis.hmset(this.JOB_PREFIX + jobId, updates);
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  private formatMemoryUsage(memUsage: NodeJS.MemoryUsage) {
    return {
      rss: this.formatFileSize(memUsage.rss),
      heapTotal: this.formatFileSize(memUsage.heapTotal),
      heapUsed: this.formatFileSize(memUsage.heapUsed),
    };
  }

  private extractRedisMemoryUsage(info: string): string {
    const match = info.match(/used_memory_human:([^\r\n]+)/);
    return match ? match[1] : 'unknown';
  }
}