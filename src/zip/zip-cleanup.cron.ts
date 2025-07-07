// src/cron/zip-cleanup.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import Redis from 'ioredis';

@Injectable()
export class ZipCleanupCron {
  private readonly logger = new Logger(ZipCleanupCron.name);
  private readonly s3: S3Client;
  private readonly redis: Redis;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
      forcePathStyle: true,
    });

    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }

  @Cron('0 */6 * * *') // Every 6 hours
  async handleCleanup() {
    const bucket = process.env.S3_BUCKET_NAME || '';
    try {
      const listCmd = new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: 'zips/',
      });
      const { Contents } = await this.s3.send(listCmd);

      const expired = Contents?.filter((f) => {
        const age = Date.now() - new Date(f.LastModified!).getTime();
        return age > 6 * 60 * 60 * 1000;
      });

      if (expired?.length) {
        const deleteCmd = new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: expired.map((f) => ({ Key: f.Key! })),
          },
        });
        await this.s3.send(deleteCmd);

        this.logger.log(`Deleted ${expired.length} expired ZIPs`);
      }

      // Clean Redis keys
      const keys = await this.redis.keys('zip:*');
      if (keys.length) {
        await this.redis.del(...keys);
        this.logger.log(`Deleted ${keys.length} Redis cache keys`);
      }
    } catch (err) {
      this.logger.error(`Cron cleanup failed: ${err.message}`);
    }
  }
}
