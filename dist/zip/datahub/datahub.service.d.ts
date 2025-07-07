import { Cache } from 'cache-manager';
interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    buffer: Buffer;
    size: number;
}
export declare class DatahubService {
    private readonly cacheManager;
    private readonly logger;
    private s3;
    CONCURRENCY_LIMIT: number;
    constructor(cacheManager: Cache);
    uploadFile(folderPath: string, file: MulterFile): Promise<{
        fileName: string;
        downloadUrl: string;
        message: string;
    }>;
    generatePresignedUrl(userId: string, fileName: string): Promise<string>;
    deleteFile(fileName: string): Promise<void>;
    listAllObjectsInBucket(): Promise<string[]>;
    deleteBucket(): Promise<void>;
    generatePresignedUrlForUpload(fileName: string, contentType: string): Promise<string>;
    generateMultiplePresignedUrlsForUpload(files: {
        fileName: string;
        contentType: string;
    }[]): Promise<string[]>;
    generateGetPresignedUrl(fileName: string): Promise<string>;
}
export {};
