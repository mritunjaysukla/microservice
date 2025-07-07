import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { DatahubModule } from './zip/datahub/datahub.module';
import { ZipModule } from './zip/zip.module';
import appConfig from './config/app.config';
import { ZipCleanupCron } from './zip/zip-cleanup.cron';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('app.redis.host'),
        port: configService.get('app.redis.port'),
        ttl: 3600,
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    DatahubModule,
    ZipModule,
  ],
  providers: [ZipCleanupCron],
})
export class AppModule { }
