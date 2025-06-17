/// <reference types="multer" />
import { Cache } from 'cache-manager';
export declare class DatahubService {
    private readonly cacheManager;
    private readonly logger;
    private s3;
    constructor(cacheManager: Cache);
    uploadFile(folderPath: string, file: Express.Multer.File): Promise<{
        fileName: string;
        downloadUrl: string;
        message: string;
    }>;
    generatePresignedUrl(userId: string, fileName: string): Promise<string>;
    deleteFile(fileName: string): Promise<void>;
    listAllObjectsInBucket(): Promise<string[]>;
    deleteBucket(): Promise<void>;
    CONCURRENCY_LIMIT: number;
    generatePresignedUrlForUpload(fileName: string, contentType: string): Promise<string>;
    generateMultiplePresignedUrlsForUpload(files: {
        fileName: string;
        contentType: string;
    }[]): Promise<string[]>;
    generateGetPresignedUrl(fileName: string): Promise<string>;
}
