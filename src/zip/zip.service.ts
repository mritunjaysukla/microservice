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
    // Initialize worker thread pool
    const workerPath = path.resolve(__dirname, './workers/zip-worker.js');
    const tsWorkerPath = path.resolve(__dirname, './workers/zip-worker.ts');

    this.piscina = new Piscina({
      filename: fs.existsSync(workerPath) ? workerPath : tsWorkerPath,
      maxThreads: parseInt(process.env.ZIP_MAX_THREADS || '4'),
      minThreads: parseInt(process.env.ZIP_MIN_THREADS || '2'),
      idleTimeout: 60000,
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

  async archiveAndStreamZip(dto: ZipRequestDto, res: Response) {
    const { fileUrls, zipFileName } = dto;

    if (!fileUrls || fileUrls.length === 0) {
      throw new Error('No file URLs provided');
    }

    const jobId = `zip-${uuidv4()}`;

    this.logger.log(`Starting zip job ${jobId} for ${fileUrls.length} files`);

    // Set response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName || 'archive.zip'}"`);

    try {
      // Process in worker thread for optimization
      const result = await this.piscina.run({
        fileUrls: fileUrls,
        zipFileName: zipFileName || 'archive.zip',
        jobId: jobId
      });

      if (!result || !result.filePath || !fs.existsSync(result.filePath)) {
        throw new Error('Failed to create zip file');
      }

      this.logger.log(`Zip created: ${result.filePath} (${this.formatFileSize(result.fileSize)})`);

      // Stream the file directly to response
      const stats = fs.statSync(result.filePath);
      res.setHeader('Content-Length', stats.size.toString());

      const readStream = fs.createReadStream(result.filePath);

      readStream.on('error', (error) => {
        this.logger.error(`Stream error for job ${jobId}:`, error);
        this.cleanupTempFile(result.filePath);
      });

      readStream.on('end', () => {
        this.logger.log(`Streaming completed for job ${jobId}`);
        this.cleanupTempFile(result.filePath);
      });

      // Start streaming
      readStream.pipe(res);

    } catch (error) {
      this.logger.error(`Error during zip creation for job ${jobId}:`, error);

      if (!res.headersSent) {
        res.status(500).send('Error creating ZIP archive');
      }
    }
  }

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

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}