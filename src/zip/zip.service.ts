import {
  Injectable,
  Inject,
  Logger,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as archiver from 'archiver';
import { Readable } from 'stream';
import { createWriteStream, readFileSync, unlinkSync } from 'fs';
import axios from 'axios';
import pLimit from 'p-limit';
import { ZipJob, ZipJobStatus, ZipRequest } from './interfaces/zip.interface';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class ZipService {
  private readonly logger = new Logger(ZipService.name);
  private readonly s3: S3Client;
  private readonly CONCURRENT_DOWNLOADS = 5;
  private readonly ZIP_EXPIRY_HOURS = 24;

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {
    this.s3 = new S3Client({
      region: process.env.S3_REGION!,
      endpoint: process.env.S3_ENDPOINT!, // e.g., https://s3-np1.datahub.com.np
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      forcePathStyle: true,
    });
  }

  async processZipRequest(data: ZipRequest): Promise<string> {
    const jobId = `zip_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const job: ZipJob = {
      jobId,
      userId: data.userId,         // Added missing userId
      folderId: data.folderId,
      status: ZipJobStatus.PENDING,
      progress: 0,
      totalFiles: 0,
      processedFiles: 0,
      createdAt: new Date(),       // Added missing createdAt
      updatedAt: new Date(),       // Added missing updatedAt
    };

    await this.cacheManager.set(`zip:${jobId}`, JSON.stringify(job), this.ZIP_EXPIRY_HOURS * 3600);

    this.createZip(job).catch((error) => {
      this.logger.error(`ZIP creation failed for job ${jobId}: ${error.message}`);
      this.updateJobStatus(jobId, ZipJobStatus.FAILED, error.message);
    });

    return jobId;
  }

  private async createZip(job: ZipJob): Promise<void> {
    try {
      await this.updateJobStatus(job.jobId, ZipJobStatus.PROCESSING);

      const files = await this.getFilesFromFolder(job.folderId);
      job.totalFiles = files.length;
      await this.updateJob(job);

      const zipId = Date.now().toString();
      const zipFileName = `${zipId}.zip`;
      const zipFilePath = `/tmp/${zipFileName}`;
      const output = createWriteStream(zipFilePath);
      const archive = archiver('zip', { zlib: { level: 6 } });

      archive.pipe(output);
      archive.on('error', (err: Error) => {
        throw new Error(`Archive error: ${err.message}`);
      });

      const limit = pLimit(this.CONCURRENT_DOWNLOADS);
      const downloads = files.map((file) =>
        limit(async () => {
          try {
            const stream = await this.downloadFile(file.url);
            archive.append(stream, { name: file.name });

            job.processedFiles++;
            job.progress = Math.round((job.processedFiles / job.totalFiles) * 100);
            await this.updateJob(job);
          } catch (error: any) {
            this.logger.error(`Error processing file ${file.name}: ${error.message}`);
          }
        }),
      );

      await Promise.all(downloads);
      await archive.finalize();

      // Upload ZIP to S3
      const zipBuffer = readFileSync(zipFilePath);
      const uploadCommand = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME!,
        Key: `zips/${job.jobId}.zip`,
        Body: zipBuffer,
        ContentType: 'application/zip',
      });

      await this.s3.send(uploadCommand);
      unlinkSync(zipFilePath); // clean up

      const url = await this.generatePresignedUrl(`zips/${job.jobId}.zip`);
      await this.updateJobStatus(job.jobId, ZipJobStatus.COMPLETED, undefined, url);
    } catch (error: any) {
      await this.updateJobStatus(job.jobId, ZipJobStatus.FAILED, error.message);
      throw error;
    }
  }

  private async getFilesFromFolder(folderId: string): Promise<{ name: string; url: string }[]> {
    const prefix = `uploads/${folderId}/`;

    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET_NAME!,
      Prefix: prefix,
    });

    const listResult = await this.s3.send(listCommand);
    const contents = listResult.Contents || [];

    const files = contents.filter(obj => obj.Key && !obj.Key.endsWith('/'));

    const fileData = await Promise.all(
      files.map(async (file) => {
        const signedUrl = await this.generatePresignedUrl(file.Key!);
        return {
          name: file.Key!.replace(prefix, ''), // strip folder path
          url: signedUrl,
        };
      }),
    );

    return fileData;
  }

  private async generatePresignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });

    return getSignedUrl(this.s3, command, { expiresIn: 3600 }); // 1 hour
  }

  private async downloadFile(url: string): Promise<Readable> {
    try {
      const response = await axios({
        method: 'GET',
        url,
        responseType: 'stream',
        timeout: 30000,
      });
      return response.data as Readable;
    } catch (error: any) {
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  public async getJobStatus(jobId: string): Promise<ZipJob | null> {
    const cachedJob = await this.cacheManager.get<string>(`zip:${jobId}`);
    if (!cachedJob) return null;
    return JSON.parse(cachedJob);
  }

  private async updateJob(job: ZipJob): Promise<void> {
    await this.cacheManager.set(
      `zip:${job.jobId}`,
      JSON.stringify(job),
      this.ZIP_EXPIRY_HOURS * 3600,
    );
  }

  private async updateJobStatus(
    jobId: string,
    status: ZipJobStatus,
    error?: string,
    url?: string,
  ): Promise<void> {
    const job = await this.getJobStatus(jobId);
    if (!job) return;

    job.status = status;
    if (error) job.error = error;
    if (url) job.url = url;

    await this.updateJob(job);
  }
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredZips() {
    this.logger.log('Running cleanup of expired zip files from S3...');
    try {
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.S3_BUCKET_NAME!,
        Prefix: 'zips/',
      });

      const result = await this.s3.send(listCommand);
      const now = Date.now();

      if (!result.Contents) return;

      for (const file of result.Contents) {
        if (!file.Key || !file.LastModified) continue;

        const ageHours = (now - file.LastModified.getTime()) / (1000 * 3600);
        if (ageHours > this.ZIP_EXPIRY_HOURS) {
          this.logger.log(`Deleting expired zip: ${file.Key}`);
          await this.s3.send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME!,
            Key: file.Key,
          }));
        }
      }
    } catch (error) {
      this.logger.error(`Error during cleanup: ${error.message}`);
    }
  }
}
