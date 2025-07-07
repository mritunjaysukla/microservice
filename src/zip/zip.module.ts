import { Module, forwardRef } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ZipController } from './zip.controller';
import { EnhancedZipService } from './enhanced-zip.service';
import { DatahubModule } from './datahub/datahub.module';

@Module({
  imports: [
    CacheModule.register(), // ✅ Add this line
    forwardRef(() => DatahubModule),
  ],
  controllers: [ZipController],
  providers: [EnhancedZipService],
})
export class ZipModule { }
