import { Cache } from 'cache-manager';
import { ZipRequest } from './interfaces/zip.interface';
export declare class ZipService {
    private readonly cacheManager;
    private readonly logger;
    private readonly s3;
    private readonly CONCURRENT_DOWNLOADS;
    private readonly ZIP_EXPIRY_HOURS;
    constructor(cacheManager: Cache);
    processZipRequest(data: ZipRequest): Promise<string>;
    private createZip;
    private downloadFile;
    private getJobStatus;
    private updateJob;
    private updateJobStatus;
    private generatePresignedUrl;
    private getFilesFromFolder;
}
