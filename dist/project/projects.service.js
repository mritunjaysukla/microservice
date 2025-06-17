"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b, _c, _d, _e, _f, _g;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("./entities/project.entity");
const project_setting_entity_1 = require("src/project-setting/entity/project-setting.entity");
const class_validator_1 = require("class-validator");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
const products_service_1 = require("src/products/products.service");
const gallery_setting_entity_1 = require("src/gallery-setting/entity/gallery-setting.entity");
const user_entity_1 = require("src/user/entities/user.entity");
const upload_service_1 = require("src/upload/upload.service");
const product_entity_1 = require("src/products/entity/product.entity");
const password_service_1 = require("src/user/services/password/password.service");
const typeorm_3 = require("typeorm");
const archive_project_entity_1 = require("./entities/archive-project.entity");
const date_fns_1 = require("date-fns");
const folder_entity_1 = require("src/folder/entity/folder.entity");
const folder_service_1 = require("src/folder/folder.service");
const notification_service_1 = require("src/notification/notification.service");
const site_setting_service_1 = require("src/site-setting/site-setting.service");
const datahub_service_1 = require("src/datahub/datahub.service");
let ProjectsService = class ProjectsService {
    constructor(projectRepository, uploadRepository, projectSettingRepository, gallerySettingRepository, productService, uploadService, userRepository, productRepository, passwordService, datasource, archivedProjectRepository, folderService, notificationService, siteSettingService, datahubService) {
        this.projectRepository = projectRepository;
        this.uploadRepository = uploadRepository;
        this.projectSettingRepository = projectSettingRepository;
        this.gallerySettingRepository = gallerySettingRepository;
        this.productService = productService;
        this.uploadService = uploadService;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.passwordService = passwordService;
        this.datasource = datasource;
        this.archivedProjectRepository = archivedProjectRepository;
        this.folderService = folderService;
        this.notificationService = notificationService;
        this.siteSettingService = siteSettingService;
        this.datahubService = datahubService;
    }
    async createProjectWithSetting(createProjectWithSettingDto, userId, entityManager, projectcover, sitecover) {
        const trns = await entityManager.transaction(async (transactionalEntityManager) => {
            let expiryDate;
            if (createProjectWithSettingDto.storageType === project_entity_1.StorageType.MONTHLY) {
                expiryDate = new Date();
                const month = createProjectWithSettingDto.timeline ?? 0;
                expiryDate.setMonth(expiryDate.getMonth() + month);
            }
            else {
                expiryDate = new Date();
                expiryDate.setFullYear(expiryDate.getFullYear() + 100);
            }
            const project = this.projectRepository.create({
                title: createProjectWithSettingDto.title,
                description: createProjectWithSettingDto.description,
                dateCompleted: createProjectWithSettingDto.dateCompleted,
                shootDate: createProjectWithSettingDto.shootDate,
                userId: userId,
                projectType: createProjectWithSettingDto.projectType,
                storageType: createProjectWithSettingDto.storageType,
                timeline: createProjectWithSettingDto.timeline,
                expiryDate: expiryDate,
            });
            const savedProject = await transactionalEntityManager.save(project);
            const projectSetting = this.projectSettingRepository.create({
                photoSelection: createProjectWithSettingDto.photoSelection,
                downloadOriginalPhotos: createProjectWithSettingDto.downloadOriginalPhotos,
                watermark: createProjectWithSettingDto.watermark,
                showProduct: createProjectWithSettingDto.showProduct,
                allowFeedback: createProjectWithSettingDto.allowFeedback,
                requireCredentials: createProjectWithSettingDto.requireCredentials,
                displayShareBtn: createProjectWithSettingDto.displayShareBtn,
                displayContactInfo: createProjectWithSettingDto.displayContactInfo,
                displayBusinessCard: createProjectWithSettingDto.displayBusinessCard,
                displayTestimonials: createProjectWithSettingDto.displayTestimonials,
                requirePassword: createProjectWithSettingDto.requirePassword,
                coverPhoto: createProjectWithSettingDto.coverPhoto ?? null,
                addedProducts: createProjectWithSettingDto.addedProducts,
                project: savedProject,
                ...(createProjectWithSettingDto.requirePassword && {
                    password: createProjectWithSettingDto.password
                        ? await this.passwordService.generate(createProjectWithSettingDto.password)
                        : '',
                }),
            });
            const savedProjectSetting = await transactionalEntityManager.save(projectSetting);
            const fullProducts = savedProjectSetting.addedProducts?.length
                ? await this.productRepository.findBy({
                    id: (0, typeorm_2.In)(savedProjectSetting.addedProducts),
                })
                : [];
            const gallerySetting = this.gallerySettingRepository.create({
                projectHeader: createProjectWithSettingDto.projectHeader ?? 'Fotofolio Gallery',
                projectDescription: createProjectWithSettingDto.projectDescription ??
                    'This is a Fotofolio Gallery',
                primaryFonts: createProjectWithSettingDto.primaryFonts ?? gallery_setting_entity_1.Fonts.MONTSERRAT,
                secondaryFonts: createProjectWithSettingDto.secondaryFonts ?? gallery_setting_entity_1.Fonts.ROBOTO,
                photoLayout: createProjectWithSettingDto.photoLayout ?? gallery_setting_entity_1.PhotoLayout.GRID_LAYOUT,
                menuIcon: createProjectWithSettingDto.menuIcon ?? gallery_setting_entity_1.MenuIcon.FILLED,
                imageGap: createProjectWithSettingDto.imageGap ?? gallery_setting_entity_1.ImageGap.MEDIUM,
                colorSchema: createProjectWithSettingDto.colorSchema ?? gallery_setting_entity_1.ColorSchema.LIGHT,
                projectCover: createProjectWithSettingDto.siteCover ?? undefined,
                project: savedProject,
            });
            const savedGallerySetting = await transactionalEntityManager.save(gallerySetting);
            project.gallerySetting = savedGallerySetting;
            project.projectSetting = savedProjectSetting;
            await transactionalEntityManager.save(project);
            await this.notificationService.createNotification(userId, 'title', 'message');
            return {
                projectSetting: savedProjectSetting,
                gallerySetting: savedGallerySetting,
                products: fullProducts,
            };
        });
        if (projectcover) {
            console.log('uploading cover photo');
            const projectCover = await this.uploadProjectCoverImage(projectcover, trns.projectSetting.projectId);
            console.log('projectCover', projectCover);
            const projectSetting = await this.projectSettingRepository.findOne({
                where: { projectId: trns.projectSetting.projectId },
            });
            if (projectSetting) {
                projectSetting.coverPhoto = projectCover;
                await this.projectSettingRepository.save(projectSetting);
                console.log('projectSetting', projectSetting);
                console.log('Project cover image uploaded successfully', projectCover);
            }
        }
        if (sitecover) {
            const projectSiteCover = await this.uploadProjectSiteCoverImage(sitecover, trns.gallerySetting.projectId);
            const gallerysetting = await this.gallerySettingRepository.findOne({
                where: {
                    id: trns.gallerySetting.id,
                },
            });
            if (gallerysetting) {
                gallerysetting.projectCover = projectSiteCover;
                await this.gallerySettingRepository.save(gallerysetting);
            }
        }
        console.log('Project created with setting:', trns);
        return trns;
    }
    async findAll(page = 1, limit = 10) {
        const [projects, total] = await this.projectRepository.findAndCount({
            relations: ['projectSetting'],
            skip: Number((page - 1) * limit),
            take: limit,
        });
        return {
            projects,
            total,
        };
    }
    async findOne(id) {
        const [project, fileStats] = await Promise.all([
            this.projectRepository.findOne({
                where: { id },
                relations: ['projectSetting'],
            }),
            this.uploadRepository
                .createQueryBuilder('upload')
                .select([
                'COUNT(*) as totalFiles',
                'COALESCE(SUM(upload.filesize), 0) as totalSize',
            ])
                .where('upload.projectId = :id', { id })
                .getRawOne(),
        ]);
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        return {
            project,
            totalFiles: parseInt(fileStats.totalFiles),
            totalSize: parseInt(fileStats.totalSize),
        };
    }
    async updateProjectWithSetting(projectId, updateDto, projectCover) {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        const { title, description, dateCompleted, shootDate, projectType, storageType, timeline, ...projectSettingFields } = updateDto;
        if (title)
            project.title = title;
        if (description)
            project.description = description;
        if (dateCompleted)
            project.dateCompleted = dateCompleted;
        if (shootDate)
            project.shootDate = shootDate;
        if (projectType)
            project.projectType = projectType;
        if (storageType)
            project.storageType = storageType;
        if (timeline)
            project.timeline = timeline;
        await this.projectRepository.save(project);
        const updatedProject = await this.projectRepository.findOne({
            where: { id: projectId },
            relations: ['projectSetting'],
        });
        if (projectCover) {
            const coverPhotoUrl = await this.uploadProjectCoverImage(projectCover, projectId);
            project.projectSetting.coverPhoto = coverPhotoUrl;
            await this.projectRepository.save(project);
        }
        if (!updatedProject) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        return updatedProject;
    }
    async deleteProject(id) {
        const result = await this.projectRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
    }
    async getProjectByUser(userId, projectName, startDate, endDate, clientName, page = 1, limit = 10, req) {
        if (!(0, class_validator_1.isUUID)(userId)) {
            throw new common_1.BadRequestException('Invalid User ID');
        }
        const query = this.projectRepository
            .createQueryBuilder('project')
            .leftJoinAndSelect('project.user', 'user')
            .leftJoinAndSelect('project.sharedUsers', 'sharedUser')
            .leftJoinAndSelect('sharedUser.user', 'sharedUserDetails')
            .leftJoinAndSelect('project.projectSetting', 'projectSetting')
            .where('user.id = :userId', { userId });
        const role = req.user?.role;
        if (role === 'photographer') {
            query.andWhere('user.id = :userId', { userId });
            if (clientName) {
                query.andWhere('sharedUserDetails.name ILIKE :clientName', {
                    clientName: `%${clientName}%`,
                });
            }
        }
        else if (role === 'client') {
            query.andWhere('sharedUser.user.id = :userId', { userId });
        }
        if (projectName) {
            query.andWhere('project.title ILIKE :projectName', {
                projectName: `%${projectName}%`,
            });
        }
        if (startDate && endDate) {
            query.andWhere('project.shootDate BETWEEN :startDate AND :endDate', {
                startDate,
                endDate,
            });
        }
        else if (startDate) {
            query.andWhere('project.shootDate >= :startDate', { startDate });
        }
        else if (endDate) {
            query.andWhere('project.shootDate <= :endDate', { endDate });
        }
        console.log(query.getQuery());
        const [projects, total] = await query
            .take(limit)
            .skip((page - 1) * limit)
            .getManyAndCount();
        if (role === 'photographer') {
            const productIds = projects
                .map((project) => project.projectSetting?.addedProducts || [])
                .flat()
                .filter((id) => !!id);
            const products = await Promise.all(productIds.map((id) => this.productService.findOne(id)));
            projects.forEach((project) => {
                project.products = products.filter((product) => project.projectSetting?.addedProducts?.includes(product.id) ||
                    false);
            });
        }
        const projectIds = projects.map((project) => project.id);
        const stats = await Promise.all(projectIds.map(async (projectId) => {
            const stat = await this.uploadService.getFileCountAndSize(projectId);
            return {
                projectId,
                ...stat,
            };
        }));
        return { projects, total, stats };
    }
    catch(error) {
        throw new common_1.BadRequestException('Error fetching projects: ' + error.message);
    }
    async changeTimeline(id, changeTimelineDto) {
        const project = await this.projectRepository.findOne({
            where: { id },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${id} not found`);
        }
        return this.projectRepository.update(id, {
            expiryDate: changeTimelineDto.extentedDate,
        });
    }
    async getProjectById(projectId) {
        const project = await this.projectRepository
            .createQueryBuilder('project')
            .leftJoinAndSelect('project.gallerySetting', 'gallerySetting')
            .leftJoinAndSelect('project.projectSetting', 'projectSetting')
            .leftJoinAndMapMany('project.folders', 'project.folders', 'folders', 'folders.isSelected = true')
            .where('project.id = :projectId', { projectId })
            .getOne();
        if (project?.gallerySetting?.projectCover) {
            const galleryCover = project?.gallerySetting?.projectCover.replace('https://s3-np1.datahub.com.np/fotosfolio/', '');
            const presignedUrl = await this.datahubService.generateGetPresignedUrl(galleryCover);
            project.gallerySetting.projectCover = presignedUrl;
        }
        if (project?.projectSetting?.coverPhoto) {
            const gallerySiteCover = project.projectSetting.coverPhoto.replace('https://s3-np1.datahub.com.np/fotosfolio/', '');
            const presignedUrl = await this.datahubService.generateGetPresignedUrl(gallerySiteCover);
            project.projectSetting.coverPhoto = presignedUrl;
        }
        console.log(project?.projectSetting.coverPhoto);
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID ${projectId} not found`);
        }
        const user = await this.userRepository.findOne({
            where: { id: project.userId },
        });
        project.Photographer = {
            userName: user?.name,
            userId: user?.id,
        };
        await this.incrementField(projectId, 'views');
        if (user?.id) {
            const legal = await this.siteSettingService.getLegalAgreement(user?.id);
            const userAgreement = await this.siteSettingService.getUserAgreement(user?.id);
            return { project, legal, userAgreement };
        }
        return { project };
    }
    async getProjectsWithFolders(userId) {
        if (!(0, class_validator_1.isUUID)(userId)) {
            throw new common_1.BadRequestException('Invalid User ID');
        }
        const projects = await this.projectRepository
            .createQueryBuilder('project')
            .leftJoinAndSelect('project.folders', 'folder')
            .leftJoinAndSelect('project.user', 'user')
            .where('project.userId = :userId', { userId })
            .orderBy('project.createdAt', 'DESC')
            .getMany();
        if (!projects || projects.length === 0) {
            throw new common_1.NotFoundException(`No projects found for user ${userId}`);
        }
        const transformedProjects = projects.map((project) => ({
            id: project.id,
            title: project.title,
            description: project.description || '',
            dateCompleted: project.dateCompleted || new Date(),
            shootDate: project.shootDate || new Date(),
            projectType: project.projectType || '',
            folders: project.folders.map((folder) => ({
                id: folder.id,
                title: folder.title,
                description: folder.description || '',
                eventDate: folder.eventDate || new Date(),
                location: folder.location || '',
                coverImg: folder.coverImg || '',
                isSelected: folder.isSelected,
            })),
        }));
        return { projects: transformedProjects };
    }
    async deleteExpiredProjects() {
        const now = new Date();
        const expiredProjects = await this.projectRepository
            .createQueryBuilder('project')
            .where('"project"."expiryDate" < :now', { now })
            .andWhere('"project"."deleted" = true')
            .getMany();
        console.log('Expired and deleted projects to be deleted:', expiredProjects);
        await this.projectRepository
            .createQueryBuilder()
            .delete()
            .from('project')
            .where('"expiryDate" < :now', { now })
            .andWhere('"deleted" = true')
            .execute();
    }
    async findExpiredProjects(now) {
        try {
            return await this.projectRepository
                .createQueryBuilder('project')
                .leftJoinAndSelect('project.projectSetting', 'projectSetting')
                .leftJoinAndSelect('project.gallerySetting', 'gallerySetting')
                .leftJoinAndSelect('project.folders', 'folders')
                .where('project.expiryDate <= :now', { now })
                .getMany();
        }
        catch (error) {
            throw new Error(`Failed to fetch expired projects: ${error.message}`);
        }
    }
    async deleteProjectsWithTrueDeleted() {
        try {
            await this.projectRepository
                .createQueryBuilder()
                .delete()
                .where('deleted = :deleted', { deleted: true })
                .execute();
        }
        catch (error) {
            throw new Error(`Failed to delete projects with deleted = true: ${error.message}`);
        }
    }
    async markExpiredProjectsAsDeleted(projects) {
        try {
            for (const project of projects) {
                if (!project.deleted) {
                    project.deleted = true;
                    await this.projectRepository.save(project);
                }
            }
        }
        catch (error) {
            throw new Error(`Failed to mark projects as deleted: ${error.message}`);
        }
    }
    async incrementView(projectId) {
        return this.incrementField(projectId, 'views');
    }
    async incrementDownload(projectId) {
        return this.incrementField(projectId, 'downloads');
    }
    async incrementField(projectId, field) {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        project[field] = (project[field] || 0) + 1;
        return this.projectRepository.save(project);
    }
    async uploadProjectCoverImage(file, projectId) {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
            relations: ['user', 'projectSetting'],
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with id ${projectId} not found`);
        }
        if (project.projectSetting.coverPhoto) {
            const file = await this.uploadService.getFileByDownloadUrl(project.projectSetting.coverPhoto);
            if (file) {
                await this.uploadService.deleteFile(file.fileId, project.user.id);
            }
        }
        const folderPath = `${project.user.name}_${project.user.id}/${project.title}_${projectId}/ProjectCover`;
        const uploadResult = await this.uploadService.uploadFile(file, folderPath, project.user.id);
        console.log(uploadResult);
        return uploadResult.response.downloadUrl;
    }
    async comparePwd(pwd, projectSettingId) {
        const projectSetting = await this.projectSettingRepository.findOne({
            where: { id: projectSettingId },
            select: ['password'],
        });
        if (!projectSetting) {
            throw new common_1.NotFoundException('Project setting not found');
        }
        if (!projectSetting.password) {
            throw new common_1.NotFoundException('Project setting not found');
        }
        return await this.passwordService.compare(pwd, projectSetting?.password);
    }
    async archiveProject(timeline, projects) {
        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            let expiredProjects;
            if (!projects) {
                expiredProjects = await this.findExpiredProjects(new Date());
                console.log(expiredProjects);
                if (expiredProjects.length === 0) {
                    await queryRunner.rollbackTransaction();
                    return;
                }
            }
            else {
                expiredProjects = projects;
            }
            const archivedProjects = expiredProjects.map((project) => {
                const archived = new archive_project_entity_1.ArchivedProject();
                Object.assign(archived, project);
                archived.expiryDate = (0, date_fns_1.addWeeks)(new Date(), timeline ?? 2);
                archived.deleted = true;
                if (project.folders && project.folders.length > 0) {
                    archived.folderId = project.folders.map((folder) => folder.id);
                }
                return archived;
            });
            await queryRunner.manager.save(archive_project_entity_1.ArchivedProject, archivedProjects);
            const projectIds = expiredProjects.map((p) => p.id);
            await queryRunner.manager.update(project_entity_1.Project, { id: (0, typeorm_2.In)(projectIds) }, { deleted: true });
            await queryRunner.commitTransaction();
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw new Error(`Failed to archive projects: ${error.message}`);
        }
        finally {
            await queryRunner.release();
        }
    }
    async getArchivedProjectsByUserId(userId) {
        const user = await this.userRepository.findOne({
            where: {
                id: userId,
            },
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const archivedProjects = await this.archivedProjectRepository.find({
            where: {
                userId,
            },
        });
        return archivedProjects;
    }
    async restoreArchivedProjectById(id, extensionMonths) {
        if (!id) {
            throw new Error('No project UUID provided for restoration.');
        }
        if (extensionMonths <= 0) {
            throw new Error('The extension value must be greater than 0.');
        }
        const queryRunner = this.datasource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const archivedProject = await queryRunner.manager.findOne(archive_project_entity_1.ArchivedProject, { where: { id } });
            if (!archivedProject) {
                throw new Error(`No archived project found with the UUID: ${id}`);
            }
            console.log(`[RESTORE] Found archived project: ${id}`);
            const project = queryRunner.manager.create(project_entity_1.Project, archivedProject);
            project.deleted = false;
            if (project.expiryDate) {
                project.expiryDate = (0, date_fns_1.addMonths)(project.expiryDate, extensionMonths);
            }
            else {
                throw new Error(`Project expiryDate is missing for archived project ID: ${id}`);
            }
            await queryRunner.manager.save(project_entity_1.Project, project);
            console.log(`[RESTORE] Restored project with ID: ${id}`);
            if (archivedProject.projectSettingId) {
                const settingResult = await queryRunner.manager.update(project_setting_entity_1.ProjectSetting, { id: archivedProject.projectSettingId }, { projectId: project.id });
                console.log(`[RESTORE] Re-linked ProjectSetting with ID ${archivedProject.projectSettingId} to project ${project.id}`);
            }
            else {
                console.log(`[RESTORE] No ProjectSetting ID found in ArchivedProject.`);
            }
            if (archivedProject.gallerySettingId) {
                const galleryResult = await queryRunner.manager.update(gallery_setting_entity_1.GallerySetting, { id: archivedProject.gallerySettingId }, { projectId: project.id });
                console.log(`[RESTORE] Re-linked GallerySetting with ID ${archivedProject.gallerySettingId} to project ${project.id}`);
            }
            else {
                console.log(`[RESTORE] No GallerySetting ID found in ArchivedProject.`);
            }
            if (archivedProject.folderId && archivedProject.folderId.length > 0) {
                await queryRunner.manager.update(folder_entity_1.Folder, {
                    id: (0, typeorm_2.In)(archivedProject.folderId),
                }, {
                    project: { id: project.id },
                });
                console.log(`[RESTORE] Re-linked folders: ${archivedProject.folderId.join(', ')}`);
            }
            else {
                console.log(`[RESTORE] No folderIds found in archived project for relinking.`);
            }
            await queryRunner.manager.update(archive_project_entity_1.ArchivedProject, { id }, { deleted: true });
            console.log(`[RESTORE] Archived project marked as deleted: ${id}`);
            await queryRunner.commitTransaction();
            console.log(`[RESTORE] Transaction committed for project: ${id}`);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            console.error(`[RESTORE] Transaction failed: ${error.message}`);
            throw new Error(`Failed to restore archived project: ${error.message}`);
        }
        finally {
            await queryRunner.release();
            console.log(`[RESTORE] QueryRunner released.`);
        }
    }
    async restoreArchivedProjectsByIds(projects) {
        if (!projects || projects.length === 0) {
            throw new Error('No projects provided for restoration.');
        }
        const restorePromises = projects.map(async (project) => {
            const { projectId, extensionMonth } = project;
            if (typeof projectId !== 'string' || typeof extensionMonth !== 'number') {
                throw new Error(`Invalid data for project with ID: ${projectId}. Ensure projectId is a string and extensionMonth is a number.`);
            }
            if (projectId && extensionMonth !== undefined) {
                await this.restoreArchivedProjectById(projectId, extensionMonth);
                return { projectId, restored: true };
            }
            else {
                throw new Error(`Missing project data for project with ID: ${projectId}`);
            }
        });
        try {
            const restoredProjects = await Promise.all(restorePromises);
            return restoredProjects;
        }
        catch (error) {
            throw new Error(`Failed to restore some projects: ${error.message}`);
        }
    }
    async deleteExpiredArchivedProjects() {
        const now = new Date();
        const expiredProjects = await this.archivedProjectRepository
            .createQueryBuilder('ArchivedProject')
            .where('"ArchivedProject"."expiryDate" < :now', { now })
            .andWhere('"ArchivedProject"."deleted" = true')
            .getMany();
        console.log('Deleted archived projects to be deleted:', expiredProjects);
        if (expiredProjects.length === 0)
            return;
        const gallerySettingIds = expiredProjects
            .map((project) => project.gallerySettingId)
            .filter((id) => !!id);
        const projectSettingIds = expiredProjects
            .map((project) => project.projectSettingId)
            .filter((id) => !!id);
        const folderData = expiredProjects
            .flatMap((project) => (project.folderId || []).map((folderId) => ({
            folderId,
            userId: project.userId,
        })))
            .filter((data) => data.folderId && data.userId);
        await this.archivedProjectRepository
            .createQueryBuilder()
            .delete()
            .from('ArchivedProject')
            .where('"expiryDate" < :now', { now })
            .andWhere('"deleted" = true')
            .execute();
        if (gallerySettingIds.length) {
            await this.gallerySettingRepository
                .createQueryBuilder()
                .delete()
                .from(gallery_setting_entity_1.GallerySetting)
                .where('id IN (:...ids)', { ids: gallerySettingIds })
                .execute();
        }
        if (projectSettingIds.length) {
            await this.projectSettingRepository
                .createQueryBuilder()
                .delete()
                .from(project_setting_entity_1.ProjectSetting)
                .where('id IN (:...ids)', { ids: projectSettingIds })
                .execute();
        }
        for (const { folderId, userId } of folderData) {
            await this.folderService.removeMany([folderId], userId);
        }
    }
    async update(id, data) {
        await this.projectRepository.update(id, data);
        const updated = await this.projectRepository.findOneBy({ id });
        if (!updated) {
            throw new Error(`Project with id ${id} not found after update.`);
        }
        return updated;
    }
    async uploadProjectSiteCoverImage(file, projectId) {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
            relations: ['user', 'gallerySetting'],
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with id ${projectId} not found`);
        }
        if (project.gallerySetting.projectCover) {
            const file = await this.uploadService.getFileByDownloadUrl(project.gallerySetting.projectCover);
            if (file) {
                await this.uploadService.deleteFile(file.fileId, project.user.id);
            }
        }
        const folderPath = `${project.user.name}_${project.user.id}/${project.title}_${projectId}/ProjectCover`;
        const uploadResult = await this.uploadService.uploadFile(file, folderPath, project.user.id);
        return uploadResult.response.downloadUrl;
    }
    async isIpAllowed(projectId, req) {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
            relations: ['user', 'gallerySetting'],
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with id ${projectId} not found`);
        }
        const ip = this.getClientIp(req);
        if (project.allowedIps) {
            const ipAllowed = project.allowedIps.includes(ip);
            if (ipAllowed)
                return true;
            if (project.allowedIps.length < 1000) {
                project.allowedIps.push(ip);
                await this.projectRepository.save(project);
                return true;
            }
            return false;
        }
        project.allowedIps = [];
        project.allowedIps.push(ip);
        await this.projectRepository.save(project);
        return true;
    }
    getClientIp(req) {
        console.log(req.headers);
        const cf = req.headers['cf-connecting-ip'];
        return cf;
    }
};
ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(upload_entity_1.Upload)),
    __param(2, (0, typeorm_1.InjectRepository)(project_setting_entity_1.ProjectSetting)),
    __param(3, (0, typeorm_1.InjectRepository)(gallery_setting_entity_1.GallerySetting)),
    __param(6, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(7, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(10, (0, typeorm_1.InjectRepository)(archive_project_entity_1.ArchivedProject)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof products_service_1.ProductService !== "undefined" && products_service_1.ProductService) === "function" ? _a : Object, typeof (_b = typeof upload_service_1.UploadService !== "undefined" && upload_service_1.UploadService) === "function" ? _b : Object, typeorm_2.Repository,
        typeorm_2.Repository, typeof (_c = typeof password_service_1.PasswordService !== "undefined" && password_service_1.PasswordService) === "function" ? _c : Object, typeorm_3.DataSource,
        typeorm_2.Repository, typeof (_d = typeof folder_service_1.FolderService !== "undefined" && folder_service_1.FolderService) === "function" ? _d : Object, typeof (_e = typeof notification_service_1.NotificationService !== "undefined" && notification_service_1.NotificationService) === "function" ? _e : Object, typeof (_f = typeof site_setting_service_1.SiteSettingService !== "undefined" && site_setting_service_1.SiteSettingService) === "function" ? _f : Object, typeof (_g = typeof datahub_service_1.DatahubService !== "undefined" && datahub_service_1.DatahubService) === "function" ? _g : Object])
], ProjectsService);
exports.ProjectsService = ProjectsService;
//# sourceMappingURL=projects.service.js.map