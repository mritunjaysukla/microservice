/// <reference types="multer" />
import { ProjectsService } from './projects.service';
import { Project } from './entities/project.entity';
import { CreateProjectWithSettingDto } from './dto/create-project-with-setting.dto';
import { DataSource } from 'typeorm';
import { UpdateProjectWithSettingDto } from './dto/update-project-with-setting.dto';
import { GetProjectByUserDto } from './dto/get-project.dto';
import { ChangeTimelineDto } from './dto/change-timeline.dto';
import { ProjectsWithFoldersResponseDto } from './dto/project-folder-response.dto';
import { ArchivedProject } from './entities/archive-project.entity';
export declare class ProjectsController {
    private readonly projectsService;
    private readonly dataSource;
    constructor(projectsService: ProjectsService, dataSource: DataSource);
    findAll(page?: number, pageSize?: number): Promise<{
        projects: Project[];
        total: number;
    }>;
    findAllArchived(): Promise<{
        message: string;
    }>;
    comparePwd(pwd: string, settingId: string): Promise<any>;
    getProjectByUserId(req: any, query: GetProjectByUserDto): Promise<{
        projects: Project[];
        total: number;
    }>;
    getProjectById(id: string): Promise<{
        project: Project;
        legal: any;
        userAgreement: any;
    } | {
        project: Project;
        legal?: undefined;
        userAgreement?: undefined;
    }>;
    findOne(id: string): Promise<{
        project: Project;
        totalFiles: number;
        totalSize: number;
    }>;
    createProjectWithSetting(files: {
        projectCover?: Express.Multer.File[];
        siteCover?: Express.Multer.File[];
    }, createProjectWithSettingDto: CreateProjectWithSettingDto, req: any): Promise<{
        message: string;
        data: {
            projectSetting: ProjectSetting;
            gallerySetting: GallerySetting;
            products: Product[];
        };
    }>;
    restoreArchivedProjects(projects: {
        projectId: string;
        extensionMonth: number;
    }[]): Promise<{
        projectId: string;
        restored: boolean;
    }[]>;
    getArchivedProjects(userId: string): Promise<ArchivedProject[]>;
    incrementViews(projectId: string): Promise<Project>;
    incrementDownloads(projectId: string): Promise<Project>;
    updateProjectSetting(id: string, changeTimelineDto: ChangeTimelineDto): Promise<import("typeorm").UpdateResult>;
    updateProjectWithSetting(id: string, updateProjectWithSettingDto: UpdateProjectWithSettingDto, projectCover?: Express.Multer.File): Promise<Project>;
    deleteExpiredProjects(): Promise<void>;
    remove(id: string): Promise<void>;
    getProjectsWithFolders(userId: string): Promise<ProjectsWithFoldersResponseDto>;
    uploadCoverImage(projectId: string, file: Express.Multer.File): Promise<{
        downloadUrl: string;
    }>;
    uploadSiteCoverImage(projectId: string, file: Express.Multer.File): Promise<{
        downloadUrl: string;
    }>;
    deleteExpiredArchivedProjects(): Promise<void>;
}
