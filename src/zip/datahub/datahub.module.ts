import { Module } from '@nestjs/common';
import { DatahubService } from './datahub.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: 24 * 60 * 60,
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [DatahubService],
  exports: [DatahubService],
})
export class DatahubModule { }
