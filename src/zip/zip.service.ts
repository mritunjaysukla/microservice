import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
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
  private readonly JOB_PREFIX = 'zipjob:';
  private readonly ACTIVE_JOBS_KEY = 'zip:active_jobs';
  private readonly MAX_CONCURRENT_JOBS = 10;
  private readonly ZIP_EXPIRY_HOURS = 6;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: () => 100,
      maxRetriesPerRequest: 3,
    });
  }

  onModuleInit() {
    // Initialize worker thread pool with optimal settings
    const workerPath = path.resolve(__dirname, './workers/zip-worker.js');
    const tsWorkerPath = path.resolve(__dirname, './workers/zip-worker.ts');

    this.piscina = new Piscina({
      filename: fs.existsSync(workerPath) ? workerPath : tsWorkerPath,
      maxThreads: parseInt(process.env.ZIP_MAX_THREADS || '4'),
      minThreads: parseInt(process.env.ZIP_MIN_THREADS || '1'),
      idleTimeout: 60000, // 1 minute idle timeout
      maxQueue: 50, // Maximum queued tasks
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
   * Create asynchronous zip job with proper load balancing
   */
  async createZipJob(dto: ZipRequestDto): Promise<string> {
    if (!dto.fileUrls || dto.fileUrls.length === 0) {
      throw new HttpException('No file URLs provided', HttpStatus.BAD_REQUEST);
    }

    // Check active jobs limit
    const activeJobs = await this.redis.scard(this.ACTIVE_JOBS_KEY);
    if (activeJobs >= this.MAX_CONCURRENT_JOBS) {
      throw new HttpException(
        'Server is busy. Please try again later.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    const jobId = `job-${uuidv4()}`;
    const now = Date.now();
    const expiresAt = now + (this.ZIP_EXPIRY_HOURS * 60 * 60 * 1000);

    // Store job metadata
    await this.redis.hmset(this.JOB_PREFIX + jobId, {
      status: 'pending',
      zipFileName: dto.zipFileName || `archive-${Date.now()}.zip`,
      error: '',
      fileUrls: JSON.stringify(dto.fileUrls),
      createdAt: now.toString(),
      expiresAt: expiresAt.toString(),
      fileCount: dto.fileUrls.length.toString(),
      progress: '0',
    });

    // Add to active jobs set
    await this.redis.sadd(this.ACTIVE_JOBS_KEY, jobId);

    // Set expiration for job data
    await this.redis.expire(this.JOB_PREFIX + jobId, this.ZIP_EXPIRY_HOURS * 3600);

    // Start processing job in background
    this.processZipJob(jobId, dto).catch((err) => {
      this.logger.error(`Zip job ${jobId} failed:`, err);
      this.updateJobStatus(jobId, 'failed', err.message);
    });

    return jobId;
  }

  /**
   * Process zip job using worker threads
   */
  private async processZipJob(jobId: string, dto: ZipRequestDto) {
    try {
      await this.updateJobStatus(jobId, 'processing');

      // Validate presigned URLs before processing
      const validUrls = await this.validatePresignedUrls(dto.fileUrls);

      if (validUrls.length === 0) {
        throw new Error('No valid presigned URLs found');
      }

      if (validUrls.length < dto.fileUrls.length) {
        this.logger.warn(`${dto.fileUrls.length - validUrls.length} URLs were invalid and skipped`);
      }

      // Execute zip creation in worker thread
      const result = await this.piscina.run({
        fileUrls: validUrls,
        zipFileName: dto.zipFileName,
        jobId: jobId,
      });

      // Update job with completion data
      await this.redis.hmset(this.JOB_PREFIX + jobId, {
        status: 'completed',
        tempFilePath: result.filePath,
        fileSize: result.fileSize?.toString() || '0',
        successCount: result.successCount?.toString() || '0',
        completedAt: Date.now().toString(),
      });

    } catch (error) {
      await this.updateJobStatus(jobId, 'failed', error.message);
      throw error;
    } finally {
      // Remove from active jobs
      await this.redis.srem(this.ACTIVE_JOBS_KEY, jobId);
    }
  }

  /**
   * Validate presigned URLs to ensure they're accessible
   */
  private async validatePresignedUrls(urls: string[]): Promise<string[]> {
    const validUrls: string[] = [];

    // Simple validation - check if URLs look like presigned URLs
    for (const url of urls) {
      try {
        const parsedUrl = new URL(decodeURIComponent(url));

        // Check if it looks like a presigned URL (has query parameters)
        if (parsedUrl.searchParams.size > 0) {
          validUrls.push(url);
        } else {
          this.logger.warn(`Invalid presigned URL format: ${url}`);
        }
      } catch (err) {
        this.logger.warn(`Invalid URL: ${url}`);
      }
    }

    return validUrls;
  }

  /**
   * Get job status with detailed information
   */
  async getJobStatus(jobId: string): Promise<{
    status: string;
    error?: string;
    downloadUrl?: string;
    progress?: string;
    fileSize?: string;
    fileCount?: number;
    successCount?: number;
    createdAt?: string;
    expiresAt?: string;
    message?: string;
  }> {
    const jobKey = this.JOB_PREFIX + jobId;
    const job = await this.redis.hgetall(jobKey);

    if (!job || Object.keys(job).length === 0) {
      return { status: 'not_found' };
    }

    const result: any = {
      status: job.status,
      fileCount: parseInt(job.fileCount || '0'),
      createdAt: job.createdAt,
      expiresAt: job.expiresAt,
    };

    switch (job.status) {
      case 'pending':
        result.message = 'Job is queued for processing';
        break;
      case 'processing':
        result.message = 'Files are being zipped';
        result.progress = `${job.progress || 0}% complete`;
        break;
      case 'completed':
        result.downloadUrl = `/zip/download/${jobId}`;
        result.fileSize = this.formatFileSize(parseInt(job.fileSize || '0'));
        result.successCount = parseInt(job.successCount || '0');
        break;
      case 'failed':
        result.error = job.error;
        result.successCount = parseInt(job.successCount || '0');
        result.partialSuccess = result.successCount > 0;
        break;
    }

    return result;
  }

  /**
   * Download zip file with proper error handling
   */
  async downloadZip(jobId: string, res: Response, inline: boolean = false) {
    const jobKey = this.JOB_PREFIX + jobId;
    const job = await this.redis.hgetall(jobKey);

    if (!job || job.status !== 'completed' || !job.tempFilePath) {
      throw new HttpException(
        'Zip file not found or not ready',
        HttpStatus.NOT_FOUND
      );
    }

    const filePath = job.tempFilePath;

    if (!fs.existsSync(filePath)) {
      throw new HttpException(
        'Zip file has expired. Please create a new job.',
        HttpStatus.GONE
      );
    }

    const stats = fs.statSync(filePath);
    const disposition = inline ? 'inline' : 'attachment';

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Length', stats.size.toString());
    res.setHeader('Content-Disposition', `${disposition}; filename="${job.zipFileName || 'archive.zip'}"`);
    res.setHeader('Cache-Control', 'no-cache');

    const readStream = fs.createReadStream(filePath);

    readStream.on('error', (err) => {
      this.logger.error('Error streaming zip file:', err);
      if (!res.headersSent) {
        res.status(500).send('Download error');
      }
    });

    readStream.on('end', () => {
      // Clean up temp file and Redis entry after successful download
      this.cleanupJob(jobId, filePath);
    });

    readStream.pipe(res);
  }

  /**
   * List jobs with filtering
   */
  async listJobs(status?: string, limit: number = 20) {
    const pattern = this.JOB_PREFIX + '*';
    const keys = await this.redis.keys(pattern);
    const jobs = [];

    for (const key of keys.slice(0, limit)) {
      const job = await this.redis.hgetall(key);
      if (!status || job.status === status) {
        const jobId = key.replace(this.JOB_PREFIX, '');
        jobs.push({
          jobId,
          status: job.status,
          createdAt: new Date(parseInt(job.createdAt || '0')).toISOString(),
          fileCount: parseInt(job.fileCount || '0'),
          zipFileName: job.zipFileName,
        });
      }
    }

    return {
      jobs: jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      total: jobs.length,
    };
  }

  /**
   * Cancel a job
   */
  async cancelJob(jobId: string) {
    const jobKey = this.JOB_PREFIX + jobId;
    const job = await this.redis.hgetall(jobKey);

    if (!job || Object.keys(job).length === 0) {
      throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
    }

    if (job.status === 'completed' || job.status === 'failed') {
      throw new HttpException(
        'Job cannot be cancelled (already completed or failed)',
        HttpStatus.CONFLICT
      );
    }

    await this.redis.hset(jobKey, 'status', 'cancelled');
    await this.redis.srem(this.ACTIVE_JOBS_KEY, jobId);

    return {
      message: 'Job cancelled successfully',
      jobId,
    };
  }

  /**
   * Get service health status
   */
  async getHealthStatus() {
    const activeJobs = await this.redis.scard(this.ACTIVE_JOBS_KEY);

    return {
      status: 'healthy',
      workers: {
        active: this.piscina.threads.length,
        total: this.piscina.options.maxThreads,
        queue: this.piscina.queueSize,
      },
      redis: this.redis.status,
      activeJobs,
      uptime: process.uptime(),
    };
  }

  /**
   * Update job status
   */
  private async updateJobStatus(jobId: string, status: string, error?: string) {
    const updates: any = { status };
    if (error) updates.error = error;

    await this.redis.hmset(this.JOB_PREFIX + jobId, updates);
  }

  /**
   * Clean up job resources
   */
  private async cleanupJob(jobId: string, filePath?: string) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlink(filePath, (err) => {
        if (err) this.logger.error(`Failed to delete temp file: ${filePath}`, err);
        else this.logger.log(`Cleaned up temp file: ${filePath}`);
      });
    }

    await this.redis.del(this.JOB_PREFIX + jobId);
    await this.redis.srem(this.ACTIVE_JOBS_KEY, jobId);
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}