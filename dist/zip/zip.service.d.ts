import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ZipRequestDto } from './dto/zip-request.dto';
import { Response } from 'express';
export declare class ZipService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private redis;
    private piscina;
    private s3Client;
    constructor();
    onModuleInit(): void;
    onModuleDestroy(): void;
    archiveAndStreamZip(dto: ZipRequestDto, res: Response): Promise<void>;
    private cleanupTempFile;
    private formatFileSize;
}
