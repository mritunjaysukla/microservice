import { Response } from 'express';
import { ZipService } from './zip.service';
import { ZipRequestDto } from './dto/zip-request.dto';
export declare class ZipController {
    private readonly zipService;
    constructor(zipService: ZipService);
    createZip(dto: ZipRequestDto, res: Response): Promise<void>;
    getHealth(): Promise<{
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
    getInfo(): Promise<{
        name: string;
        version: string;
        description: string;
        features: string[];
        supportedFileTypes: string[];
        performance: {
            maxConcurrentFiles: string;
            processingMode: string;
            memoryUsage: string;
            responseTime: string;
        };
    }>;
}
