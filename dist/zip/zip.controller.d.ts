import { Response } from 'express';
import { ZipService } from './zip.service';
import { ZipRequestDto } from './dto/zip-request.dto';
export declare class ZipController {
    private readonly zipService;
    constructor(zipService: ZipService);
    createZipJob(dto: ZipRequestDto): Promise<{
        jobId: string;
        message: string;
        estimatedTime: string;
    }>;
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
    healthCheck(): Promise<{
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
}
