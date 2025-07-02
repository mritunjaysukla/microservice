import { ZipService } from './zip.service';
import { ZipRequestDto } from './dto/zip-request.dto';
import { Response } from 'express';
export declare class ZipController {
    private readonly zipService;
    constructor(zipService: ZipService);
    createZip(dto: ZipRequestDto, res: Response): Promise<void>;
    createZipJob(dto: ZipRequestDto): Promise<{
        jobId: string;
    }>;
    getStatus(jobId: string): Promise<{
        status: string;
        error?: string;
        downloadUrl?: string;
    }>;
    downloadZip(jobId: string, res: Response): Promise<void>;
}
