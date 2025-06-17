declare class ZipFile {
    fileName: string;
    downloadUrl: string;
}
export declare class ZipJobDto {
    jobId: string;
    folderId: string;
    files: ZipFile[];
    userId: string;
}
export {};
