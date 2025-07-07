import {
  Injectable,
  Logger,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatahubService } from './datahub/datahub.service';
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
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) return String((error as any).message);
  return 'Unknown error occurred';
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

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => DatahubService))
    private readonly datahubService: DatahubService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: any,
  ) {
    this.s3 = new S3Client({
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      forcePathStyle: true,
    });
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
    this.tempDir = path.resolve(__dirname, '../../../tmp');
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async archiveAndStreamZip(dto: ZipRequestDto, res: Response, userId: string) {
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const { fileUrls, zipFileName } = dto;
    if (!fileUrls || fileUrls.length === 0) {
      throw new Error('No file URLs provided');
    }
    const jobId = `zip-${uuidv4()}`;
    const cacheKey = `zip:${userId}:${jobId}`;

    try {
      const files = await this.getFilesMetadata(fileUrls);
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);

      const cacheResult = await this.redis.get(cacheKey);
      if (cacheResult) {
        this.logger.log(`Cache hit for job ${jobId}`);
        res.redirect(cacheResult);
        return;
      }

      const SMALL_SIZE = 200 * 1024 * 1024; // 200MB threshold
      if (totalSize <= SMALL_SIZE) {
        await this.zipAndStream(files, zipFileName, res, jobId);
      } else {
        await this.zipInChunksAndUpload(
          files,
          zipFileName,
          res,
          jobId,
          userId,
          cacheKey,
        );
      }
    } catch (error) {
      const message = getErrorMessage(error);
      this.logger.error(`Error in archiveAndStreamZip: ${message}`);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to process zip request', message });
      }
    }
  }

  private async getFilesMetadata(fileUrls: string[]) {
    const results = [];
    for (const url of fileUrls) {
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
        const message = getErrorMessage(error);
        this.logger.warn(`Failed to get metadata for ${url}: ${message}`);
      }
    }
    return results;
  }

  private extractKeyFromUrl(url: string) {
    const parts = url.split('/');
    return parts.slice(4).join('/');
  }

  private async zipAndStream(files: any[], zipFileName: string, res: Response, jobId: string) {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName || 'archive.zip'}"`);

    const archive = archiver.default('zip', { zlib: { level: 1 } });

    archive.on('error', (err) => {
      const message = getErrorMessage(err);
      this.logger.error(`Archive error: ${message}`);
      if (!res.headersSent) {
        res.status(500).send('Archive error');
      }
    });

    archive.pipe(res);

    for (const file of files) {
      try {
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
      } catch (error) {
        const message = getErrorMessage(error);
        this.logger.warn(`Failed to append file ${file.key}: ${message}`);
      }
    }

    await archive.finalize();
    this.logger.log(`Zip streamed for job ${jobId}`);
  }

  private async zipInChunksAndUpload(files: any[], zipFileName: string, res: Response, jobId: string, userId: string, cacheKey: string) {
    const CHUNK_SIZE = 20;
    const chunks: any[][] = [];
    for (let i = 0; i < files.length; i += CHUNK_SIZE) {
      chunks.push(files.slice(i, i + CHUNK_SIZE));
    }

    try {
      const tempZipPaths: string[] = await Promise.all(
        chunks.map((chunk, idx) => this.createChunkZip(chunk, `${jobId}-chunk${idx}.zip`)),
      );

      const finalZipPath = path.join(this.tempDir, `${jobId}-final.zip`);
      await this.mergeZips(tempZipPaths, finalZipPath);

      const s3Key = `zips/${userId}/${jobId}/${zipFileName || 'archive.zip'}`;
      await this.uploadToS3(finalZipPath, s3Key);

      const presignedUrl = await getSignedUrl(
        this.s3,
        new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: s3Key,
        }),
        { expiresIn: 60 * 60 },
      );

      await this.redis.set(cacheKey, presignedUrl, 'EX', 60 * 60);
      res.json({ downloadUrl: presignedUrl });

      for (const p of tempZipPaths.concat([finalZipPath])) {
        if (fs.existsSync(p)) {
          fs.unlinkSync(p);
        }
      }
    } catch (error) {
      const message = getErrorMessage(error);
      this.logger.error(`Error in zipInChunksAndUpload: ${message}`);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to create large zip', message });
      }
    }
  }

  private async createChunkZip(files: any[], zipName: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
      const tempPath = path.join(this.tempDir, zipName);
      const output = fs.createWriteStream(tempPath);
      const archive = archiver.default('zip', { zlib: { level: 1 } });

      output.on('close', () => resolve(tempPath));
      archive.on('error', (err) => reject(new Error(getErrorMessage(err))));

      archive.pipe(output);

      for (const file of files) {
        try {
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
        } catch (error) {
          this.logger.warn(`Failed to append file ${file.key} in chunk zip: ${getErrorMessage(error)}`);
        }
      }

      archive.finalize();
    });
  }

  private async mergeZips(zipPaths: string[], finalZipPath: string) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(finalZipPath);
      const archive = archiver.default('zip', { zlib: { level: 1 } });

      output.on('close', () => resolve(true));
      archive.on('error', (err) => reject(new Error(getErrorMessage(err))));

      archive.pipe(output);

      zipPaths.forEach((zipPath) => {
        archive.append(fs.createReadStream(zipPath), { name: path.basename(zipPath) });
      });

      archive.finalize();
    });
  }

  private async uploadToS3(filePath: string, key: string) {
    try {
      const fileStream = fs.createReadStream(filePath);
      await this.s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: key,
          Body: fileStream,
          ContentType: 'application/zip',
        }),
      );
    } catch (error) {
      this.logger.error(`Upload to S3 failed: ${getErrorMessage(error)}`);
      throw new Error('Upload to S3 failed');
    }
  }
}
