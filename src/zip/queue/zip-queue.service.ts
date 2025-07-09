import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';

interface ZipJobData {
  files: any[];
  zipFileName: string;
  userId: string;
  jobId: string;
  s3Key: string;
}

@Injectable()
export class ZipQueueService implements OnModuleInit {
  private readonly logger = new Logger(ZipQueueService.name);
  private zipQueue: Queue;
  private worker: Worker;
  private redis: Redis;

  constructor(private configService: ConfigService) {
    const redisOptions = {
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: this.configService.get('REDIS_PORT') || 6379,
      maxRetriesPerRequest: null,
    };

    this.zipQueue = new Queue('zip-jobs', { connection: redisOptions });
    this.redis = new Redis(redisOptions);
  }

  async onModuleInit() {
    const redisOptions = {
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: this.configService.get('REDIS_PORT') || 6379,
      maxRetriesPerRequest: null,
    };

    this.worker = new Worker('zip-jobs', async (job: Job<ZipJobData>) => {
      this.logger.log(`Processing job ${job.id}: ${job.data.jobId}`);

      try {
        const { files, zipFileName, jobId } = job.data;

        // Update progress
        await job.updateProgress(10);

        // For large files, store directly to file system instead of Redis
        const zipFilePath = await this.createZipFile(files, jobId, job);

        // Store file path and metadata in Redis
        const metaKey = `zip:meta:${jobId}`;
        await this.redis.setex(metaKey, 60 * 60 * 24, JSON.stringify({
          status: 'completed',
          fileName: zipFileName,
          filePath: zipFilePath,
          size: require('fs').statSync(zipFilePath).size,
          createdAt: new Date().toISOString()
        }));

        await job.updateProgress(100);
        this.logger.log(`Job ${jobId} completed - file stored at ${zipFilePath}`);

        return { status: 'completed', filePath: zipFilePath };
      } catch (error) {
        this.logger.error(`Error processing job ${job.id}: ${error.message}`);

        // Store error in Redis
        const metaKey = `zip:meta:${job.data.jobId}`;
        await this.redis.setex(metaKey, 60 * 60 * 24, JSON.stringify({
          status: 'failed',
          error: error.message,
          createdAt: new Date().toISOString()
        }));

        throw error;
      }
    }, {
      connection: redisOptions,
      concurrency: parseInt(process.env.ZIP_WORKER_CONCURRENCY || '2'),
    });

    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job.id} failed: ${err.message}`);
    });
  }

  private async createZipFile(files: any[], jobId: string, job?: Job): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const fs = require('fs');
      const path = require('path');

      // Create temp directory if it doesn't exist
      const tempDir = path.join(process.cwd(), 'tmp', 'zips');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const zipFilePath = path.join(tempDir, `${jobId}.zip`);
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', { zlib: { level: 6 } });

      output.on('close', () => {
        resolve(zipFilePath);
      });

      archive.on('error', reject);
      archive.pipe(output);

      // Add files to archive
      let processed = 0;
      for (const [index, file] of files.entries()) {
        try {
          this.logger.log(`Adding file ${index + 1}/${files.length}: ${file.originalName}`);

          const response = await fetch(file.url);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${file.originalName}: ${response.status}`);
          }

          const arrayBuffer = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          archive.append(buffer, { name: file.originalName });

          processed++;
          if (job && processed % 10 === 0) {
            const progress = Math.min(90, 10 + (processed / files.length) * 80);
            await job.updateProgress(progress);
          }

        } catch (error) {
          this.logger.warn(`Failed to add file ${file.originalName}: ${error.message}`);
        }
      }

      archive.finalize();
    });
  }

  async addZipJob(data: ZipJobData): Promise<string> {
    const job = await this.zipQueue.add('create-zip', data);
    this.logger.log(`Added job ${job.id} to queue`);
    return job.id as string;
  }

  async getJobStatus(jobId: string): Promise<any> {
    const job = await this.zipQueue.getJob(jobId);

    if (!job) {
      return { status: 'not-found' };
    }

    const state = await job.getState();
    const progress = job.progress || 0;

    return {
      id: job.id,
      status: state,
      progress: progress,
      data: job.data,
      createdAt: job.timestamp,
    };
  }
}