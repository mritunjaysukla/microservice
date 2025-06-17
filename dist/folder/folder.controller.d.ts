/// <reference types="multer" />
import { CreateFolderDto } from './dto/create-folder.dto';
import { FolderService } from './folder.service';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { FolderCategory } from './entity/folder.entity';
import { CreatePortfolioFolderDto, UpdatePortfolioFolderDto } from './dto/portfolio-folder.dto';
import { Response } from 'express';
export declare class FolderController {
    private readonly folderService;
    constructor(folderService: FolderService);
    getAddedFolders(page: number, limit: number, req: any): Promise<{
        folders: {
            totalFileCount: number;
            totalFileSize: number;
            id: string;
            title: string;
            userId: string;
            folderCategory: FolderCategory;
            description?: string;
            eventDate?: Date;
            location?: string;
            coverImg?: string;
            isSelected: boolean;
            isAdded: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    downloadFolderZip(folderId: string, res: Response): Promise<void>;
    getSelectedFolders(page: number, limit: number, req: any): Promise<{
        folders: {
            id: string;
            title: string;
            userId: string;
            folderCategory: FolderCategory;
            description?: string;
            eventDate?: Date;
            location?: string;
            coverImg?: string;
            isSelected: boolean;
            isAdded: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    create(createEventDto: CreateFolderDto, coverImg: Express.Multer.File, req: any): Promise<import("./entity/folder.entity").Folder>;
    createPortfolioFolder(createEventDto: CreatePortfolioFolderDto, req: any, coverImg?: Express.Multer.File): Promise<import("./entity/folder.entity").Folder>;
    selectFolder(body: {
        folderIds: string[];
    }): Promise<import("./entity/folder.entity").Folder[]>;
    addFolder(body: {
        folderIds: string[];
    }): Promise<import("./entity/folder.entity").Folder[]>;
    findAll(): Promise<{
        folders: {
            folder: import("./entity/folder.entity").Folder;
            totalFileCount: number;
            totalFileSize: number;
        }[];
        project?: {
            name: string;
            expiryDate: string | Date;
        };
    }>;
    getImagesByFolderId(page: number, limit: number, folderId: string, mimeType?: string): Promise<{
        data: Upload[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getFolderByProjectAndFolderId(folderId: string): Promise<{
        folderName: string;
        noOfPic: number;
        shootDate: any;
        coverImg: string;
    }>;
    findFoldersByProjectId(projectId: string): Promise<{
        folders: {
            folder: import("./entity/folder.entity").Folder;
            totalFileCount: number;
            totalFileSize: number;
        }[];
        project?: {
            name: string;
            expiryDate: string | Date;
        };
    }>;
    findOne(id: string): Promise<import("./entity/folder.entity").Folder & {
        images: Upload[];
    }>;
    update(id: string, updateEventDto: UpdateFolderDto, req: any, coverImg?: Express.Multer.File): Promise<import("./entity/folder.entity").Folder>;
    updatePortfolioSelection(folderId: string, fileIds: string[]): Promise<{
        message: string;
        data: any[];
    }>;
    remove(id: string, req: any): Promise<void>;
    updatePortfolioFolder(id: string, updateEventDto: UpdatePortfolioFolderDto, req: any, coverImg?: Express.Multer.File): Promise<import("./entity/folder.entity").Folder>;
}
