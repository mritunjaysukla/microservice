interface ZipTaskParams {
    fileUrls: string[];
    zipFileName?: string;
    jobId?: string;
}
interface ZipResult {
    filePath: string;
    fileSize: number;
    successCount: number;
    totalCount: number;
}
export default function zipTask(params: ZipTaskParams): Promise<ZipResult>;
export {};
