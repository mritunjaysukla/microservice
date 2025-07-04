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
    private validateUrls;
    private cleanupTempFile;
    private formatFileSize;
    getHealthStatus(): Promise<{
        status: string;
        workers: {
            active: number;
            total: number;
            queue: number;
        };
        redis: {
            status: "end" | "close" | "ready" | "wait" | "reconnecting" | "connecting" | "connect";
        };
        mode: string;
        features: string[];
        uptime: string;
        memoryUsage: {
            rss: string;
            heapTotal: string;
            heapUsed: string;
            external: string;
        };
    }>;
    private formatUptime;
    private formatMemoryUsage;
}
