import { Module } from '@nestjs/common';
import { ZipService } from './zip/zip.service';
import { ZipController } from './zip/zip.controller';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.development',
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      // @ts-ignore - Redis store typing issue
      store: async () => {
        return redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: Number(process.env.REDIS_PORT) || 6379,
          },
          ttl: 3600,
        });
      },
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [ZipController],
  providers: [ZipService],
})
export class AppModule { }
