import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ZipRequestDto } from './dto/zip-request.dto';
import { Response } from 'express';
export declare class ZipService implements OnModuleInit, OnModuleDestroy {
    private readonly logger;
    private redis;
    private piscina;
    private readonly JOB_PREFIX;
    private readonly ACTIVE_JOBS_KEY;
    private readonly MAX_CONCURRENT_JOBS;
    private readonly ZIP_EXPIRY_HOURS;
    constructor();
    onModuleInit(): void;
    onModuleDestroy(): void;
    createZipJob(dto: ZipRequestDto): Promise<string>;
    private processZipJob;
    private validatePresignedUrls;
    getJobStatus(jobId: string): Promise<{
        status: string;
        error?: string;
        downloadUrl?: string;
        progress?: string;
        fileSize?: string;
        fileCount?: number;
        successCount?: number;
        createdAt?: string;
        expiresAt?: string;
        message?: string;
    }>;
    downloadZip(jobId: string, res: Response, inline?: boolean): Promise<void>;
    listJobs(status?: string, limit?: number): Promise<{
        jobs: any[];
        total: number;
    }>;
    cancelJob(jobId: string): Promise<{
        message: string;
        jobId: string;
    }>;
    getHealthStatus(): Promise<{
        status: string;
        workers: {
            active: number;
            total: number;
            queue: number;
        };
        redis: "wait" | "reconnecting" | "connecting" | "connect" | "ready" | "close" | "end";
        activeJobs: number;
        uptime: number;
    }>;
    private updateJobStatus;
    private cleanupJob;
    private formatFileSize;
}
