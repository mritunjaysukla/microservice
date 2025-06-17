import { ZipService } from './zip.service';
import { ZipJobDto } from './dto/zip.dto';
export declare class ZipController {
    private readonly zipService;
    constructor(zipService: ZipService);
    handleCreateZip(data: ZipJobDto): Promise<{
        jobId: string;
    }>;
    handleGetZipStatus(payload: {
        jobId: string;
    }): Promise<{
        status: string;
        message: string;
        progress?: undefined;
        url?: undefined;
        error?: undefined;
    } | {
        status: import("./interfaces/zip.interface").ZipJobStatus;
        progress: number;
        url: string;
        error: string;
        message?: undefined;
    }>;
}
