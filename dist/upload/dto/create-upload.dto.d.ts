export declare class CreateUploadDto {
    fileId: string;
    fileName: string;
    mime_type: string;
    friendlyUrl?: string;
    downloadUrl: string;
    nativeUrl?: string;
    s3Url: string;
    folder: string;
    filesize: number;
    folderId?: string;
    projectId?: string;
}
