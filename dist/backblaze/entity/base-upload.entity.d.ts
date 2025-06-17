export declare abstract class BaseUpload {
    fileId: string;
    fileName: string;
    mime_type: string;
    friendlyUrl: string;
    downloadUrl: string;
    nativeUrl: string;
    s3Url: string;
    folder: string;
    filesize: number;
    isFileSelected: boolean;
    folderId?: string;
    portfolioFolderIds?: string[];
    projectId?: string;
    isFileDeleted: boolean;
    deletedat: Date | null;
    uploadedAt: Date;
}
