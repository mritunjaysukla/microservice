import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { EnhancedZipService } from '../enhanced-zip.service';
import { ConfigService } from '@nestjs/config';
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

  constructor(private configService: ConfigService) {
    const redisOptions = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      // BullMQ requires maxRetriesPerRequest to be null
      maxRetriesPerRequest: null
    };

    this.zipQueue = new Queue('zip-jobs', {
      connection: redisOptions,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: 100,
      },
    });
  }

  async onModuleInit() {
    const redisOptions = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      // BullMQ requires maxRetriesPerRequest to be null
      maxRetriesPerRequest: null
    };

    this.worker = new Worker('zip-jobs', async (job: Job<ZipJobData>) => {
      this.logger.log(`Processing job ${job.id}: ${job.data.jobId}`);
      try {
        // Job processing logic here
        // For now just log progress
        await job.updateProgress(100);
        return { status: 'completed' };
      } catch (error) {
        this.logger.error(`Error processing job ${job.id}: ${error.message}`);
        throw error;
      }
    }, {
      connection: redisOptions,
      concurrency: parseInt(process.env.ZIP_WORKER_CONCURRENCY || '2'),
    });

    this.worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, error) => {
      this.logger.error(`Job ${job.id} failed: ${error.message}`);
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
