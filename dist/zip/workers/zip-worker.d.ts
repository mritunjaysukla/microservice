interface ZipTaskParams {
    fileUrls: string[];
    zipFileName?: string;
    jobId?: string;
    streaming?: boolean;
    batchSize?: number;
    maxRetries?: number;
}
interface ZipResult {
    filePath: string;
    fileSize: number;
    successCount: number;
    totalCount: number;
    processingTime?: number;
}
export default function zipTask(params: ZipTaskParams): Promise<ZipResult>;
export {};
