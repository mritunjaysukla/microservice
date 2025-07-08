import { Module, forwardRef } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ZipController } from './zip.controller';
import { EnhancedZipService } from './enhanced-zip.service';
import { ZipQueueService } from './queue/zip-queue.service';
import { DatahubModule } from './datahub/datahub.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ZipCleanupCron } from './zip-cleanup.cron';

@Module({
  imports: [
    CacheModule.register(),
    forwardRef(() => DatahubModule),
    ScheduleModule.forRoot(),
  ],
  controllers: [ZipController],
  providers: [EnhancedZipService, ZipQueueService, ZipCleanupCron],
  exports: [EnhancedZipService, ZipQueueService],
})
export class ZipModule { }
