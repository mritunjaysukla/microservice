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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FolderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("src/project/entities/project.entity");
const projects_service_1 = require("src/project/projects.service");
const folder_entity_1 = require("./entity/folder.entity");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
const rxjs_1 = require("rxjs");
const upload_service_1 = require("src/upload/upload.service");
const datahub_service_1 = require("src/datahub/datahub.service");
const archiver_1 = require("archiver");
const axios_1 = require("axios");
const p_limit_1 = require("p-limit");
let FolderService = class FolderService {
    constructor(projectsService, folderRepository, uploadRepository, dataSource, uploadService, projectRepository, datahubService) {
        this.projectsService = projectsService;
        this.folderRepository = folderRepository;
        this.uploadRepository = uploadRepository;
        this.dataSource = dataSource;
        this.uploadService = uploadService;
        this.projectRepository = projectRepository;
        this.datahubService = datahubService;
    }
    async getFoldersWithStats(options) {
        const folderQuery = this.folderRepository.createQueryBuilder('folder');
        if (options?.projectId) {
            folderQuery.where('folder.projectId = :projectId', {
                projectId: options.projectId,
            });
        }
        const folders = await folderQuery.getMany();
        for (const folder of folders) {
            if (folder.coverImg) {
                const downloadurl = folder.coverImg.replace(/^https:\/\/(s3-np1\.datahub\.com\.np\/fotosfolio|cdn\.fotosfolio\.com)\//, '');
                if (downloadurl) {
                    folder.coverImg =
                        await this.datahubService.generateGetPresignedUrl(downloadurl);
                }
            }
        }
        if (folders.length === 0) {
            return { folders: [] };
        }
        const folderIds = folders.map((folder) => folder.id);
        const stats = await this.uploadRepository
            .createQueryBuilder('upload')
            .select('upload.folderId', 'folderId')
            .addSelect('COUNT(upload.fileId)', 'totalFileCount')
            .addSelect('COALESCE(SUM(upload.filesize), 0)', 'totalFileSize')
            .where('upload.folderId IN (:...folderIds)', { folderIds })
            .groupBy('upload.folderId')
            .getRawMany();
        const statsMap = new Map(stats.map((stat) => [
            stat.folderId,
            {
                totalFileCount: parseInt(stat.totalFileCount, 10) || 0,
                totalFileSize: Number(stat.totalFileSize) || 0,
            },
        ]));
        let totalFileCount = 0;
        let totalFileSize = 0;
        const folderStatsList = folders.map((folder) => {
            const folderStats = statsMap.get(folder.id) || {
                totalFileCount: 0,
                totalFileSize: 0,
            };
            totalFileCount += folderStats.totalFileCount;
            totalFileSize += folderStats.totalFileSize;
            return {
                folder,
                ...folderStats,
            };
        });
        if (options?.projectId) {
            const project = await this.projectRepository.findOne({
                where: { id: options.projectId },
                select: ['title', 'expiryDate'],
            });
            if (project) {
                return {
                    folders: folderStatsList,
                    project: {
                        name: project.title,
                        expiryDate: project.expiryDate || '',
                        totalFileCount,
                        totalFileSize,
                    },
                };
            }
        }
        return {
            folders: folderStatsList,
        };
    }
    async findAllFoldersWithStats() {
        return this.getFoldersWithStats();
    }
    async findOne(id) {
        const folder = await this.folderRepository.findOneBy({ id });
        if (!folder) {
            throw new common_1.NotFoundException(`Folder with ID ${id} not found`);
        }
        const images = await this.uploadRepository.find({
            where: { folderId: id },
        });
        return {
            ...folder,
            images,
        };
    }
    async create(createEventDto, userId, coverImg) {
        const { projectId } = createEventDto;
        const { project } = await this.projectsService.findOne(projectId);
        console.log(project);
        if (!project) {
            throw new rxjs_1.NotFoundError(`project with id ${projectId} not found`);
        }
        console.log('hello');
        const newEvent = this.folderRepository.create({
            ...createEventDto,
            userId,
            project: {
                id: createEventDto.projectId,
            },
        });
        if (coverImg) {
            const img = await this.uploadService.uploadProjecttFile(coverImg, userId, projectId, newEvent.id, true);
            newEvent.coverImg = img.response.downloadUrl;
        }
        console.log('newEvent', newEvent);
        const folder = await this.folderRepository.save(newEvent);
        if (!project.folderId) {
            project.folderId = [];
        }
        project.folderId.push(folder.id);
        console.log(project);
        await this.projectsService.update(projectId, project);
        return folder;
    }
    async update(id, updateEventDto, userId, coverImg) {
        const folder = await this.folderRepository.findOne({
            where: { id },
            relations: ['project'],
        });
        console.log(folder);
        console.log(folder?.project.id);
        if (!folder) {
            throw new rxjs_1.NotFoundError('folder of id ${id} not found');
        }
        Object.assign(folder, updateEventDto);
        console.log(coverImg);
        if (coverImg) {
            console.log(folder.coverImg);
            if (folder.coverImg) {
                console.log(folder.coverImg);
                const img = await this.uploadRepository.findOne({
                    where: { downloadUrl: folder.coverImg },
                });
                if (img) {
                    console.log(img.fileId);
                    await this.uploadService.deleteFile(img.fileId, userId);
                }
            }
            console.log(id);
            const newCoverImg = await this.uploadService.uploadProjecttFile(coverImg, userId, folder.project.id, id, true);
            folder.coverImg = newCoverImg.response.downloadUrl.replace('https://s3-np1.datahub.com.np/fotosfolio/', '');
        }
        return await this.folderRepository.save(folder);
    }
    async remove(id, userId) {
        const folder = await this.findOne(id);
        const img = await this.uploadRepository.find({ where: { folderId: id } });
        img.map(async (i) => {
            await this.uploadService.deleteFile(i.fileId, userId);
        });
        await this.folderRepository.remove(folder);
    }
    async removeMany(ids, userId) {
        const removePromises = ids.map((id) => this.remove(id, userId));
        await Promise.all(removePromises);
    }
    async findFoldersByProjectId(projectId) {
        return this.getFoldersWithStats({ projectId });
    }
    async findFolderByFolderAndProjectId(folderId) {
        const folder = await this.folderRepository.findOne({
            where: { id: folderId },
            relations: ['project'],
        });
        if (!folder) {
            throw new rxjs_1.NotFoundError('folder not found');
        }
        const project = await this.projectsService.findOne(folder?.project.id);
        if (!project && !folder) {
            throw new rxjs_1.NotFoundError('Either project or folder is not found of given ids');
        }
        let noOfPic = await this.uploadRepository.count({
            where: { folderId },
        });
        console.log(noOfPic);
        if (folder.coverImg && noOfPic !== 0) {
            noOfPic -= 1;
        }
        return {
            folderName: folder.title,
            noOfPic,
            shootDate: folder.eventDate,
            coverImg: folder.coverImg || '',
        };
    }
    async isSelectedFolders(folderId) {
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            const folder = await transactionalEntityManager.findOne(folder_entity_1.Folder, {
                where: { id: folderId },
            });
            if (!folder) {
                throw new rxjs_1.NotFoundError(`Folder with id ${folderId} not found`);
            }
            const files = await transactionalEntityManager.find(upload_entity_1.Upload, {
                where: { folderId },
            });
            if (files.length === 0) {
                throw new rxjs_1.NotFoundError(`No files found in folder with id ${folderId}`);
            }
            files.forEach((file) => {
                file.isFileSelected = true;
            });
            await transactionalEntityManager.save(files);
            folder.isSelected = true;
            await transactionalEntityManager.save(folder);
            return folder;
        });
    }
    async selectMultipleFolders(folderIds) {
        return await Promise.all(folderIds.map(async (folderId) => {
            return await this.selectFolder(folderId);
        }));
    }
    async updatePortfolioSelection(folderId, fileIds) {
        if (!folderId || !fileIds || fileIds.length === 0) {
            throw new Error('Invalid folderId or fileIds');
        }
        const folder = await this.folderRepository.findOne({
            where: { id: folderId },
        });
        if (!folder) {
            throw new Error('no folder found for folderId {folderId}');
        }
        const files = await this.uploadRepository.find({
            where: { fileId: (0, typeorm_2.In)(fileIds) },
        });
        files.forEach((file) => {
            file.isFileSelected = true;
        });
        folder.isAdded = true;
        await this.folderRepository.save(folder);
        return await this.uploadRepository.save(files);
    }
    async selectFolder(folderId) {
        const folder = await this.folderRepository.findOne({
            where: { id: folderId },
        });
        if (!folder) {
            throw new Error('folder not found with forlderid {folderId}');
        }
        folder.isSelected = !folder.isSelected;
        return await this.folderRepository.save(folder);
    }
    async addFolder(folderId) {
        const folder = await this.folderRepository.findOne({
            where: { id: folderId },
        });
        if (!folder) {
            throw new Error('folder not found with forlderid {folderId}');
        }
        folder.isAdded = !folder.isAdded;
        return await this.folderRepository.save(folder);
    }
    async addMultipleFolders(folderIds) {
        return await Promise.all(folderIds.map(async (folderId) => {
            return await this.addFolder(folderId);
        }));
    }
    async getImagesFromFolderId(page, limit, folderId, mimeType) {
        const whereCondition = { folderId };
        if (mimeType) {
            whereCondition.mime_type = mimeType;
        }
        const [images, total] = await this.uploadRepository.findAndCount({
            where: whereCondition,
            skip: (page - 1) * limit,
            take: limit,
            order: { fileName: 'ASC' },
        });
        await Promise.all(images.map(async (image) => {
            const filePath = `${image.folder}/${image.fileName}`;
            image.downloadUrl =
                await this.datahubService.generateGetPresignedUrl(filePath);
        }));
        return {
            data: images,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getImagesByFolderId(folderId) {
        const images = await this.uploadRepository.find({
            where: {
                folderId,
            },
            order: { fileName: 'ASC' },
        });
        await Promise.all(images.map(async (image) => {
            const filePath = `${image.folder}/${image.fileName}`;
            image.downloadUrl =
                await this.datahubService.generateGetPresignedUrl(filePath);
        }));
        return {
            images,
        };
    }
    async getAddedFolders(page, limit, userId) {
        const [folders, total] = await this.folderRepository.findAndCount({
            where: {
                isAdded: true,
                project: {
                    userId: userId,
                },
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        for (const folder of folders) {
            if (folder.coverImg) {
                const downloadurl = folder.coverImg.replace('https://s3-np1.datahub.com.np/fotosfolio/', '');
                if (downloadurl) {
                    folder.coverImg =
                        await this.datahubService.generateGetPresignedUrl(downloadurl);
                }
            }
        }
        const folderIds = folders.map((folder) => folder.id);
        let statsMap = new Map();
        if (folderIds.length > 0) {
            const stats = await this.uploadRepository
                .createQueryBuilder('upload')
                .select('upload.folderId', 'folderId')
                .addSelect('COUNT(upload.fileId)', 'totalFileCount')
                .addSelect('COALESCE(SUM(upload.filesize), 0)', 'totalFileSize')
                .where('upload.folderId IN (:...folderIds)', { folderIds })
                .groupBy('upload.folderId')
                .getRawMany();
            statsMap = new Map(stats.map((stat) => [
                stat.folderId,
                {
                    totalFileCount: parseInt(stat.totalFileCount, 10) || 0,
                    totalFileSize: Number(stat.totalFileSize) || 0,
                },
            ]));
        }
        const sanitizedFoldersWithStats = folders.map(({ project, ...rest }) => {
            const stats = statsMap.get(rest.id) || {
                totalFileCount: 0,
                totalFileSize: 0,
            };
            return {
                ...rest,
                ...stats,
            };
        });
        return {
            folders: sanitizedFoldersWithStats,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async getSelectedFolders(page, limit, userId) {
        const [folders, total] = await this.folderRepository.findAndCount({
            where: {
                isSelected: true,
                project: {
                    userId: userId,
                },
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        const sanitizedFolders = folders.map(({ project, ...rest }) => rest);
        return {
            folders: sanitizedFolders,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async createFolderPortfolio(createEventDto, user, coverImg) {
        if (coverImg) {
            const folderpath = `${user?.username}_${user?.id}/portfolios/FolderCover`;
            const cover = await this.uploadService.uploadFile(coverImg, folderpath, user?.id);
            createEventDto.coverImg = cover.response.downloadUrl;
        }
        const folder = this.folderRepository.create({
            ...createEventDto,
            userId: user.id,
        });
        folder.isAdded = true;
        folder.isSelected = false;
        await this.folderRepository.save(folder);
        return folder;
    }
    async updateFolderPortfolio(folderId, updateEventDto, user, coverImg) {
        const folder = await this.folderRepository.findOne({
            where: { id: folderId },
        });
        if (!folder) {
            throw new common_1.NotFoundException('Folder not found');
        }
        if (coverImg) {
            console.log(folder.coverImg);
            if (folder.coverImg) {
                console.log(folder.coverImg);
                const img = await this.uploadRepository.findOne({
                    where: { downloadUrl: folder.coverImg },
                });
                if (img) {
                    console.log(img.fileId);
                    await this.uploadService.deleteFile(img.fileId, user.id);
                }
            }
            console.log(folderId);
            const newCoverImg = await this.uploadService.uploadProjecttFile(coverImg, user.id, folder.project.id, folderId, true);
            folder.coverImg = newCoverImg.response.downloadUrl.replace('https://s3-np1.datahub.com.np/fotosfolio/', '');
            if (folder.coverImg) {
                const cover = await this.datahubService.generateGetPresignedUrl(folder.coverImg);
                updateEventDto.coverImg = cover;
            }
        }
        Object.assign(folder, updateEventDto);
        await this.folderRepository.save(folder);
        return folder;
    }
    async sendZip(folderId, res) {
        const { images } = await this.getImagesByFolderId(folderId);
        const tenimages = images.slice(0, 6);
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${folderId}.zip"`);
        const archive = (0, archiver_1.default)('zip', { store: true });
        archive.pipe(res);
        const limit = (0, p_limit_1.default)(5);
        const downloadAndAppendFile = async (file) => {
            try {
                const modifiedUrl = file.downloadUrl.replace('cdn.fotosfolio.com/', 's3-np1.datahub.com.np/fotosfolio/');
                const response = await (0, axios_1.default)({
                    method: 'get',
                    url: modifiedUrl,
                    responseType: 'stream',
                });
                console.log(`Downloading ${file.fileName}...`);
                archive.append(response.data, { name: file.fileName });
                console.log(`Downloaded ${file.fileName}`);
            }
            catch (err) {
                console.error(`Failed to download ${file.fileName}:`, err.message);
            }
        };
        const downloadPromises = tenimages.map((file) => limit(() => downloadAndAppendFile(file)));
        await Promise.all(downloadPromises);
        await archive.finalize();
    }
};
FolderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)((0, common_1.forwardRef)(() => projects_service_1.ProjectsService))),
    __param(1, (0, typeorm_1.InjectRepository)(folder_entity_1.Folder)),
    __param(2, (0, typeorm_1.InjectRepository)(upload_entity_1.Upload)),
    __param(3, (0, typeorm_1.InjectDataSource)()),
    __param(5, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __metadata("design:paramtypes", [typeof (_a = typeof projects_service_1.ProjectsService !== "undefined" && projects_service_1.ProjectsService) === "function" ? _a : Object, typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource, typeof (_b = typeof upload_service_1.UploadService !== "undefined" && upload_service_1.UploadService) === "function" ? _b : Object, typeorm_2.Repository, typeof (_c = typeof datahub_service_1.DatahubService !== "undefined" && datahub_service_1.DatahubService) === "function" ? _c : Object])
], FolderService);
exports.FolderService = FolderService;
//# sourceMappingURL=folder.service.js.map