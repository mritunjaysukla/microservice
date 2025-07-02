import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ZipRequestDto } from './dto/zip-request.dto';
import { Response } from 'express';
export declare class ZipService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private redis;
    private piscina;
    private JOB_PREFIX;
    constructor();
    onModuleInit(): void;
    onModuleDestroy(): void;
    archiveAndStreamZip(dto: ZipRequestDto, res: Response): Promise<void>;
    createZipJob(dto: ZipRequestDto): Promise<string>;
    private runZipJob;
    getJobStatus(jobId: string): Promise<{
        status: string;
        error?: string;
        downloadUrl?: string;
    }>;
    downloadZip(jobId: string, res: Response): Promise<void>;
}
