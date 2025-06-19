// src/zip/zip.module.ts
import { Module } from '@nestjs/common';
import { ZipService } from './zip.service';
import { ZipController } from './zip.controller';

@Module({
  controllers: [ZipController],
  providers: [ZipService],
})
export class ZipModule { }
