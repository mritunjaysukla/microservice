import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import Redis from 'ioredis';
import { ZipRequestDto } from './dto/zip-request.dto';
import { Response } from 'express';
import { Piscina } from 'piscina';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';  // <-- Fix: Proper import here
import * as archiver from 'archiver';
import axios from 'axios';

@Injectable()
export class ZipService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ZipService.name);
  private redis: Redis;
  private piscina: Piscina;

  private JOB_PREFIX = 'zipjob:';

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });

    this.piscina = new Piscina({
      filename: path.resolve(__dirname, './workers/zip.worker.js'),
      maxThreads: 4,
      minThreads: 1,
      execArgv: [],
    });
  }

  onModuleInit() {
    // You can setup scheduled cleanup here or via Cron service
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }

  // ======================
  // Original sync method to keep controller happy
  async archiveAndStreamZip(dto: ZipRequestDto, res: Response) {
    const { fileUrls, zipFileName } = dto;

    if (!fileUrls || fileUrls.length === 0) {
      throw new Error('No file URLs provided');
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName || 'archive.zip'}"`);

    const archive = archiver('zip');

    archive.pipe(res);

    try {
      for (const fileUrl of fileUrls) {
        try {
          const decodedUrl = decodeURIComponent(fileUrl);

          const response = await axios.get(decodedUrl, { responseType: 'stream' });

          let fileName = decodedUrl.split('/').pop() || `file-${uuidv4()}`;

          // Replace extensions as in your original code
          fileName = fileName.replace(/\.(heic|mov)$/i, '.jpg');

          archive.append(response.data, { name: fileName });
        } catch (err) {
          this.logger.error(`Error fetching or appending file ${fileUrl}: ${err.message}`);
          continue;
        }
      }

      await archive.finalize();
    } catch (err) {
      this.logger.error('Error during zip archive creation', err);
      if (!res.headersSent) {
        res.status(500).send('Error creating ZIP archive');
      }
    }
  }

  // ======================
  // Async job creation
  async createZipJob(dto: ZipRequestDto): Promise<string> {
    if (!dto.fileUrls || dto.fileUrls.length === 0) {
      throw new Error('No file URLs provided');
    }

    const jobId = `job-${uuidv4()}`;
    await this.redis.hmset(this.JOB_PREFIX + jobId, {
      status: 'pending',
      zipFileName: dto.zipFileName || 'archive.zip',
      error: '',
      fileUrls: JSON.stringify(dto.fileUrls),
    });

    this.runZipJob(jobId, dto).catch((err) => {
      this.logger.error(`Zip job ${jobId} failed`, err);
      this.redis.hset(this.JOB_PREFIX + jobId, 'status', 'failed');
      this.redis.hset(this.JOB_PREFIX + jobId, 'error', err.message);
    });

    return jobId;
  }

  private async runZipJob(jobId: string, dto: ZipRequestDto) {
    await this.redis.hset(this.JOB_PREFIX + jobId, 'status', 'processing');

    const tempFilePath: string = await this.piscina.run({
      fileUrls: dto.fileUrls,
      zipFileName: dto.zipFileName,
    });

    await this.redis.hset(this.JOB_PREFIX + jobId, 'status', 'done');
    await this.redis.hset(this.JOB_PREFIX + jobId, 'tempFilePath', tempFilePath);
  }

  async getJobStatus(jobId: string): Promise<{
    status: string;
    error?: string;
    downloadUrl?: string;
  }> {
    const jobKey = this.JOB_PREFIX + jobId;
    const job = await this.redis.hgetall(jobKey);

    if (!job || Object.keys(job).length === 0) {
      return { status: 'not_found' };
    }

    if (job.status === 'done') {
      return {
        status: 'done',
        downloadUrl: `/zip/job/download/${jobId}`,
      };
    }

    return { status: job.status, error: job.error || undefined };
  }

  async downloadZip(jobId: string, res: Response) {
    const jobKey = this.JOB_PREFIX + jobId;
    const job = await this.redis.hgetall(jobKey);

    if (!job || job.status !== 'done' || !job.tempFilePath) {
      res.status(404).send('Zip file not found or not ready');
      return;
    }

    const filePath = job.tempFilePath;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${job.zipFileName || 'archive.zip'}"`);

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);

    readStream.on('close', () => {
      fs.unlink(filePath, () => { });
      this.redis.del(jobKey);
    });

    readStream.on('error', (err) => {
      this.logger.error('Error streaming zip file', err);
      if (!res.headersSent) res.status(500).send('Download error');
    });
  }
}
