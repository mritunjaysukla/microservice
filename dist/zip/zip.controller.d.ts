import { Response } from 'express';
import { EnhancedZipService } from './enhanced-zip.service';
import { ZipQueueService } from './queue/zip-queue.service';
import { ZipRequestDto } from './dto/zip-request.dto';
export declare class ZipController {
    private readonly zipService;
    private readonly zipQueueService;
    private readonly logger;
    private redis;
    constructor(zipService: EnhancedZipService, zipQueueService: ZipQueueService);
    createZip(zipRequest: ZipRequestDto, res: Response, userId?: string): Promise<void>;
    downloadZip(jobId: string, res: Response): Promise<Response<any, Record<string, any>>>;
    getZipStatus(jobId: string): Promise<any>;
}
