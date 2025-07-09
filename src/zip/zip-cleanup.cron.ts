import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import Redis from 'ioredis';
import { promises as fs } from 'fs';
import * as path from 'path';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
}

@Injectable()
export class ZipCleanupCron {
  private readonly logger = new Logger(ZipCleanupCron.name);
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }

  @Cron('0 2 * * *') // Daily at 2 AM
  async handleCleanup() {
    try {
      // Clean Redis metadata
      const metaKeys = await this.redis.keys('zip:meta:*');
      let deletedCount = 0;

      for (const key of metaKeys) {
        const ttl = await this.redis.ttl(key);
        if (ttl < 3600) { // Less than 1 hour remaining
          // Get metadata to find file path
          const metaData = await this.redis.get(key);
          if (metaData) {
            const meta = JSON.parse(metaData);

            // Delete physical file
            const zipFilePath = meta.filePath;
            if (zipFilePath && (await fs.stat(zipFilePath).catch(() => null))) {
              await fs.unlink(zipFilePath);
              this.logger.log(`Deleted zip file: ${zipFilePath}`);
            }
          }

          // Delete Redis key
          await this.redis.del(key);
          deletedCount++;
        }
      }

      // Clean orphaned zip files (older than 24 hours)
      const zipDir = path.join(process.cwd(), 'tmp', 'zips');
      const dirExists = await fs
        .stat(zipDir)
        .then(() => true)
        .catch(() => false);

      if (dirExists) {
        const files = await fs.readdir(zipDir);
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

        for (const file of files) {
          const filePath = path.join(zipDir, file);
          const stats = await fs.stat(filePath);

          if (stats.mtime.getTime() < oneDayAgo) {
            await fs.unlink(filePath);
            this.logger.log(`Deleted orphaned zip file: ${filePath}`);
          }
        }
      }

      this.logger.log(`Cleanup completed: ${deletedCount} Redis keys deleted`);

    } catch (err) {
      this.logger.error(`Cleanup failed: ${getErrorMessage(err)}`);
    }
  }
}
