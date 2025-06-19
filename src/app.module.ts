import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ZipModule } from './zip/zip.module';
import { ZipCleanupCron } from './zip/zip-cleanup.cron';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ZipModule,
  ],
  providers: [ZipCleanupCron],
})
export class AppModule { }
