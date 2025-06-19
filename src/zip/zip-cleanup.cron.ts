// src/cron/zip-cleanup.cron.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { S3 } from 'aws-sdk';
import Redis from 'ioredis';

@Injectable()
export class ZipCleanupCron {
  private readonly logger = new Logger(ZipCleanupCron.name);
  private readonly s3: S3;
  private readonly redis: Redis;

  constructor() {
    this.s3 = new S3({
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT,
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
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
      const { Contents } = await this.s3
        .listObjectsV2({ Bucket: bucket, Prefix: 'zips/' })
        .promise();

      const expired = Contents?.filter((f) => {
        const age = Date.now() - new Date(f.LastModified!).getTime();
        return age > 6 * 60 * 60 * 1000;
      });

      if (expired?.length) {
        await this.s3
          .deleteObjects({
            Bucket: bucket,
            Delete: {
              Objects: expired.map((f) => ({ Key: f.Key! })),
            },
          })
          .promise();

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
