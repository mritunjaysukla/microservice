/// <reference types="multer" />
import { DataSource, Repository } from 'typeorm';
import { Project } from 'src/project/entities/project.entity';
import { ProjectsService } from 'src/project/projects.service';
import { Folder } from './entity/folder.entity';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { Upload } from 'src/backblaze/entity/upload.entity';
import { UploadService } from 'src/upload/upload.service';
import { DatahubService } from 'src/datahub/datahub.service';
import { CreatePortfolioFolderDto, UpdatePortfolioFolderDto } from './dto/portfolio-folder.dto';
import { Response } from 'express';
export declare class FolderService {
    private readonly projectsService;
    private readonly folderRepository;
    private readonly uploadRepository;
    private dataSource;
    private uploadService;
    private readonly projectRepository;
    private readonly datahubService;
    constructor(projectsService: ProjectsService, folderRepository: Repository<Folder>, uploadRepository: Repository<Upload>, dataSource: DataSource, uploadService: UploadService, projectRepository: Repository<Project>, datahubService: DatahubService);
    private getFoldersWithStats;
    findAllFoldersWithStats(): Promise<{
        folders: {
            folder: Folder;
            totalFileCount: number;
            totalFileSize: number;
        }[];
        project?: {
            name: string;
            expiryDate: string | Date;
        };
    }>;
    findOne(id: string): Promise<Folder & {
        images: Upload[];
    }>;
    create(createEventDto: CreateFolderDto, userId: string, coverImg?: Express.Multer.File): Promise<Folder>;
    update(id: string, updateEventDto: UpdateFolderDto, userId: string, coverImg?: Express.Multer.File): Promise<Folder>;
    remove(id: string, userId: string): Promise<void>;
    removeMany(ids: string[], userId: string): Promise<void>;
    findFoldersByProjectId(projectId: string): Promise<{
        folders: {
            folder: Folder;
            totalFileCount: number;
            totalFileSize: number;
        }[];
        project?: {
            name: string;
            expiryDate: string | Date;
        };
    }>;
    findFolderByFolderAndProjectId(folderId: string): Promise<{
        folderName: string;
        noOfPic: number;
        shootDate: any;
        coverImg: string;
    }>;
    isSelectedFolders(folderId: string): Promise<Folder>;
    selectMultipleFolders(folderIds: string[]): Promise<Folder[]>;
    updatePortfolioSelection(folderId: string, fileIds: string[]): Promise<any[]>;
    selectFolder(folderId: string): Promise<Folder>;
    addFolder(folderId: string): Promise<Folder>;
    addMultipleFolders(folderIds: string[]): Promise<Folder[]>;
    getImagesFromFolderId(page: number, limit: number, folderId: string, mimeType?: string): Promise<{
        data: Upload[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getImagesByFolderId(folderId: string): Promise<{
        images: Upload[];
    }>;
    getAddedFolders(page: number, limit: number, userId: string): Promise<{
        folders: {
            totalFileCount: number;
            totalFileSize: number;
            id: string;
            title: string;
            userId: string;
            folderCategory: import("./entity/folder.entity").FolderCategory;
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
    getSelectedFolders(page: number, limit: number, userId: string): Promise<{
        folders: {
            id: string;
            title: string;
            userId: string;
            folderCategory: import("./entity/folder.entity").FolderCategory;
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
    createFolderPortfolio(createEventDto: CreatePortfolioFolderDto, user: any, coverImg?: Express.Multer.File): Promise<Folder>;
    updateFolderPortfolio(folderId: string, updateEventDto: UpdatePortfolioFolderDto, user: any, coverImg?: Express.Multer.File): Promise<Folder>;
    sendZip(folderId: string, res: Response): Promise<void>;
}
