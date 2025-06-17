/// <reference types="multer" />
import { Repository } from 'typeorm';
import { BackblazeService } from 'src/backblaze/backblaze.service';
import { Upload } from 'src/backblaze/entity/upload.entity';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';
import { Project } from 'src/project/entities/project.entity';
import { UserStorage } from 'src/storage/entity/userStorage.entity';
import { Subscription } from 'src/subscription/entity/subscription.entity';
import { Folder } from 'src/folder/entity/folder.entity';
import { DatahubService } from 'src/datahub/datahub.service';
import { UserSession } from 'src/user/entities/user-session.entity';
import { CreateUploadDto } from './dto/create-upload.dto';
import { StorageService } from 'src/storage/storage.service';
import { Trash } from 'src/backblaze/entity/trash.entity';
import { FileExtension } from 'src/backblaze/entity/extensions.entity';
export declare class UploadService {
    private configService;
    private readonly backblazeService;
    private readonly uploadRepository;
    private readonly userRepository;
    private readonly projectRepository;
    private readonly userStorageRepository;
    private readonly subscriptionRepository;
    private readonly folderRepository;
    private readonly datahubService;
    private readonly userSessionRepository;
    private readonly storageService;
    private readonly trashRepository;
    private readonly extensionRepository;
    private readonly logger;
    private readonly MAX_RETRIES;
    private readonly RETRY_DELAY;
    private static readonly IMAGE_EXTENSIONS;
    private static readonly VIDEO_EXTENSIONS;
    constructor(configService: ConfigService, backblazeService: BackblazeService, uploadRepository: Repository<Upload>, userRepository: Repository<User>, projectRepository: Repository<Project>, userStorageRepository: Repository<UserStorage>, subscriptionRepository: Repository<Subscription>, folderRepository: Repository<Folder>, datahubService: DatahubService, userSessionRepository: Repository<UserSession>, storageService: StorageService, trashRepository: Repository<Trash>, extensionRepository: Repository<FileExtension>);
    convertUnit(value: number, fromUnit: string, toUnit: string): number;
    getFilesById(fileId: string): Promise<Upload | null>;
    private delay;
    uploadFile(file: Express.Multer.File, folderpath: string, userId: string, folderId?: string, projectId?: string): Promise<any>;
    uploadProjecttFile(file: Express.Multer.File, userId: string, projectId: string, folderId: string, coverImg?: boolean): Promise<any>;
    uploadMultipleFiles(files: Express.Multer.File[], folderPath: string, userId: string, projectId?: string, folderId?: string): Promise<any[]>;
    UploadMultipleProjectFiles(files: Express.Multer.File[], userId: string, projectId: string, folderId: string): Promise<any[]>;
    deleteFile(fileId: string, userId: string): Promise<void>;
    deleteMultipleFiles(fileNames: string[], userId: string): Promise<void[]>;
    getFilesByFolderId(folderId: string): Promise<Upload[]>;
    getFileByDownloadUrl(downloadUrl: string): Promise<Upload>;
    private getExtension;
    getImageFiles(folderId: string, page?: number, limit?: number): Promise<{
        data: Upload[];
        page: number;
        totalPages: number;
    }>;
    getVideoFiles(folderId: string, page?: number, limit?: number): Promise<{
        data: Upload[];
        page: number;
        totalPages: number;
    }>;
    getFilesByExtension(folderId: string, extension: string, page?: number, limit?: number): Promise<{
        data: Upload[];
        page: number;
        totalPages: number;
    }>;
    createUserSession(userSession: UserSession): Promise<UserSession>;
    addUploadResponse(uploadResponse: CreateUploadDto): Promise<any>;
    addMultipleUploadResponses(data: {
        files: CreateUploadDto[];
    }): Promise<any[]>;
    softDeleteUpload(id: string): Promise<void>;
    softDeleteMultipleUploads(ids: string[]): Promise<void>;
    recoverUpload(id: string): Promise<void>;
    recoverMultipleUploads(ids: string[]): Promise<void>;
    emptyTrashBin(fileIds: string | string[], userId: string): Promise<void>;
    generateBlurPreview(fileId: string): Promise<any>;
    changeFolderId(id: string, newFolderId: string): Promise<any>;
    changeMultipleFolderIds(data: {
        files: {
            id: string;
            newFolderId: string;
        }[];
    }): Promise<any[]>;
    getFileCountAndSize(projectId: string): Promise<{
        count: number;
        size: Upload;
    }>;
    deleteTrashFile(fileId: string, userId: string): Promise<void>;
    getTrashFiles(projectId: string, page?: number, limit?: number): Promise<{
        data: Trash[];
        total: number;
        page: number;
        limit: number;
    }>;
    getExtensionByFolderId(folderId: string): Promise<FileExtension[] | {
        message: string;
    }>;
    addFileToPortfolioFolder(portfolioFolderId: string, fileIds: string[]): Promise<void>;
}
