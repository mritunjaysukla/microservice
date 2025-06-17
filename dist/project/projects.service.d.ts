/// <reference types="multer" />
import { EntityManager, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectSetting } from 'src/project-setting/entity/project-setting.entity';
import { CreateProjectWithSettingDto } from './dto/create-project-with-setting.dto';
import { UpdateProjectWithSettingDto } from './dto/update-project-with-setting.dto';
import { Upload } from 'src/backblaze/entity/upload.entity';
import { ChangeTimelineDto } from './dto/change-timeline.dto';
import { ProductService } from 'src/products/products.service';
import { GallerySetting } from 'src/gallery-setting/entity/gallery-setting.entity';
import { ProjectsWithFoldersResponseDto } from './dto/project-folder-response.dto';
import { User } from 'src/user/entities/user.entity';
import { UploadService } from 'src/upload/upload.service';
import { Product } from 'src/products/entity/product.entity';
import { PasswordService } from 'src/user/services/password/password.service';
import { DataSource } from 'typeorm';
import { ArchivedProject } from './entities/archive-project.entity';
import { FolderService } from 'src/folder/folder.service';
import { NotificationService } from 'src/notification/notification.service';
import { SiteSettingService } from 'src/site-setting/site-setting.service';
import { DatahubService } from 'src/datahub/datahub.service';
import { Request } from 'express';
export declare class ProjectsService {
    private readonly projectRepository;
    private readonly uploadRepository;
    private projectSettingRepository;
    private gallerySettingRepository;
    private readonly productService;
    private readonly uploadService;
    private readonly userRepository;
    private readonly productRepository;
    private readonly passwordService;
    private datasource;
    private readonly archivedProjectRepository;
    private readonly folderService;
    private readonly notificationService;
    private readonly siteSettingService;
    private readonly datahubService;
    constructor(projectRepository: Repository<Project>, uploadRepository: Repository<Upload>, projectSettingRepository: Repository<ProjectSetting>, gallerySettingRepository: Repository<GallerySetting>, productService: ProductService, uploadService: UploadService, userRepository: Repository<User>, productRepository: Repository<Product>, passwordService: PasswordService, datasource: DataSource, archivedProjectRepository: Repository<ArchivedProject>, folderService: FolderService, notificationService: NotificationService, siteSettingService: SiteSettingService, datahubService: DatahubService);
    createProjectWithSetting(createProjectWithSettingDto: CreateProjectWithSettingDto, userId: string, entityManager: EntityManager, projectcover?: Express.Multer.File, sitecover?: Express.Multer.File): Promise<{
        projectSetting: ProjectSetting;
        gallerySetting: GallerySetting;
        products: Product[];
    }>;
    findAll(page?: number, limit?: number): Promise<{
        projects: Project[];
        total: number;
    }>;
    findOne(id: string): Promise<{
        project: Project;
        totalFiles: number;
        totalSize: number;
    }>;
    updateProjectWithSetting(projectId: string, updateDto: UpdateProjectWithSettingDto, projectCover?: Express.Multer.File): Promise<Project>;
    deleteProject(id: string): Promise<void>;
    getProjectByUser(userId: string, projectName?: string, startDate?: string, endDate?: string, clientName?: string, page?: number, limit?: number, req?: any): Promise<{
        projects: Project[];
        total: number;
        stats: any;
    }>;
    catch(error: any): void;
    changeTimeline(id: string, changeTimelineDto: ChangeTimelineDto): Promise<import("typeorm").UpdateResult>;
    getProjectById(projectId: string): Promise<{
        project: Project;
        legal: any;
        userAgreement: any;
    } | {
        project: Project;
        legal?: undefined;
        userAgreement?: undefined;
    }>;
    getProjectsWithFolders(userId: string): Promise<ProjectsWithFoldersResponseDto>;
    deleteExpiredProjects(): Promise<void>;
    findExpiredProjects(now: Date): Promise<Project[]>;
    deleteProjectsWithTrueDeleted(): Promise<void>;
    markExpiredProjectsAsDeleted(projects: Project[]): Promise<void>;
    incrementView(projectId: string): Promise<Project>;
    incrementDownload(projectId: string): Promise<Project>;
    private incrementField;
    uploadProjectCoverImage(file: Express.Multer.File, projectId: string): Promise<string>;
    comparePwd(pwd: string, projectSettingId: string): Promise<any>;
    archiveProject(timeline?: number, projects?: Project[]): Promise<void>;
    getArchivedProjectsByUserId(userId: string): Promise<ArchivedProject[]>;
    restoreArchivedProjectById(id: string, extensionMonths: number): Promise<void>;
    restoreArchivedProjectsByIds(projects: {
        projectId: string;
        extensionMonth: number;
    }[]): Promise<{
        projectId: string;
        restored: boolean;
    }[]>;
    deleteExpiredArchivedProjects(): Promise<void>;
    update(id: string, data: Partial<Project>): Promise<Project>;
    uploadProjectSiteCoverImage(file: Express.Multer.File, projectId: string): Promise<string>;
    isIpAllowed(projectId: string, req: Request): Promise<boolean>;
    private getClientIp;
}
