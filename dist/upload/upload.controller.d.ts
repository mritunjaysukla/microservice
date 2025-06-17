/// <reference types="multer" />
import { UploadService } from './upload.service';
import { DatahubService } from 'src/datahub/datahub.service';
import { DeleteFileDto } from './dto/delete-file.dto';
import { DeleteMultipleFilesDto } from './dto/delete-multiple-files.dto';
import { Upload } from 'src/backblaze/entity/upload.entity';
import { CreateUploadDto } from './dto/create-upload.dto';
import { ChangeMultipleFoldersDto } from './dto/change-folder.dto';
import { Trash } from 'src/backblaze/entity/trash.entity';
export declare class UploadController {
    private uploadService;
    private datahubService;
    constructor(uploadService: UploadService, datahubService: DatahubService);
    addUploadResponse(uploadResponse: CreateUploadDto): Promise<any>;
    addMultipleUploads(body: {
        files: CreateUploadDto[];
    }): Promise<any[]>;
    uploadImage(file: Express.Multer.File, req: any, projectId: string, folderId: string): Promise<any>;
    uploadFile(file: Express.Multer.File, req: any, folderPath: string): Promise<any>;
    uploadImages(files: Express.Multer.File[], req: any, projectId: string, folderId: string): Promise<any>;
    deleteFile(deleteFileDto: DeleteFileDto, req: any): Promise<any>;
    deleteMultipleFiles(deleteMultipleFilesDto: DeleteMultipleFilesDto, req: any): Promise<any>;
    getFilesByFolderId(folderId: string): Promise<any>;
    getBucketObjects(): Promise<any>;
    getPresignedUrlForUpload(fileName: string, contentType: string): Promise<any>;
    getMultiplePresignedUrls(body: {
        files: Array<{
            fileName: string;
            contentType: string;
        }>;
    }): Promise<string[]>;
    getFilesByExtension(folderId: string, extension: string, page?: string, limit?: string): Promise<{
        data: Upload[];
        page: number;
        totalPages: number;
    }>;
    getImages(folderId: string): Promise<{
        data: Upload[];
        page: number;
        totalPages: number;
    }>;
    getVideos(folderId: string): Promise<{
        data: Upload[];
        page: number;
        totalPages: number;
    }>;
    softDeleteMultiple(fileIds: string[]): Promise<void>;
    recoverMultiple(fileIds: string[]): Promise<void>;
    recoverFile(id: string): Promise<void>;
    emptyTrash(userId: string, fileIds: string | string[]): Promise<void>;
    getBlurredFile(fileId: string): Promise<any>;
    changeMultipleFolders(body: ChangeMultipleFoldersDto): Promise<any[]>;
    getTrashFiles(projectId: string, page?: string, limit?: string): Promise<{
        data: Trash[];
        total: number;
        page: number;
        limit: number;
    }>;
    getPresignedUrl(fileName: string): Promise<{
        url: any;
    }>;
    addFilesToFolder(id: string, fileIds: string[]): Promise<{
        message: string;
    }>;
    getAllExtensionBYFolderId(folderid: string): Promise<{
        extensions: FileExtension[] | {
            message: string;
        };
    }>;
}
