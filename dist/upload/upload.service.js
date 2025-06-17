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
var UploadService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const axios_1 = require("axios");
const backblaze_service_1 = require("src/backblaze/backblaze.service");
const upload_entity_1 = require("src/backblaze/entity/upload.entity");
const config_1 = require("@nestjs/config");
const user_entity_1 = require("src/user/entities/user.entity");
const project_entity_1 = require("src/project/entities/project.entity");
const userStorage_entity_1 = require("src/storage/entity/userStorage.entity");
const subscription_entity_1 = require("src/subscription/entity/subscription.entity");
const node_path_1 = require("node:path");
const folder_entity_1 = require("src/folder/entity/folder.entity");
const datahub_service_1 = require("src/datahub/datahub.service");
const decimal_js_1 = require("decimal.js");
const user_session_entity_1 = require("src/user/entities/user-session.entity");
const storage_service_1 = require("src/storage/storage.service");
const trash_entity_1 = require("src/backblaze/entity/trash.entity");
const sharp_1 = require("sharp");
const extensions_entity_1 = require("src/backblaze/entity/extensions.entity");
let UploadService = UploadService_1 = class UploadService {
    constructor(configService, backblazeService, uploadRepository, userRepository, projectRepository, userStorageRepository, subscriptionRepository, folderRepository, datahubService, userSessionRepository, storageService, trashRepository, extensionRepository) {
        this.configService = configService;
        this.backblazeService = backblazeService;
        this.uploadRepository = uploadRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
        this.userStorageRepository = userStorageRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.folderRepository = folderRepository;
        this.datahubService = datahubService;
        this.userSessionRepository = userSessionRepository;
        this.storageService = storageService;
        this.trashRepository = trashRepository;
        this.extensionRepository = extensionRepository;
        this.logger = new common_1.Logger(UploadService_1.name);
        this.MAX_RETRIES = 3;
        this.RETRY_DELAY = 1000;
    }
    convertUnit(value, fromUnit, toUnit) {
        const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        const fromIndex = units.indexOf(fromUnit);
        const toIndex = units.indexOf(toUnit);
        if (fromIndex === -1 || toIndex === -1) {
            throw new Error('Invalid unit provided');
        }
        return value * Math.pow(1024, fromIndex - toIndex);
    }
    async getFilesById(fileId) {
        return this.uploadRepository.findOne({ where: { fileId: fileId } });
    }
    async delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async uploadFile(file, folderpath, userId, folderId, projectId) {
        console.log(file);
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const timestamp = Date.now();
                this.logger.log('Fetching user storage and plan details...');
                let userStorage = await this.userStorageRepository.findOne({
                    where: { user: { id: userId } },
                    relations: ['plan'],
                });
                if (!userStorage) {
                    const subscription = await this.subscriptionRepository.findOne({
                        where: { user: { id: userId } },
                        relations: ['plan'],
                    });
                    const planId = subscription?.plan.id;
                    const storageLimit = String(subscription?.plan.storage);
                    userStorage = this.userStorageRepository.create({
                        user: { id: userId },
                        plan: { id: planId },
                        storageUsed: ' 0',
                        storageLimit: storageLimit,
                    });
                    userStorage = await this.userStorageRepository.save(userStorage);
                }
                const plan = userStorage.plan;
                if (!plan) {
                    throw new Error(`Plan not associated with userId: ${userId}`);
                }
                const storageUsed = new decimal_js_1.default(userStorage.storageUsed || 0);
                const storageLimit = new decimal_js_1.default(userStorage.storageLimit);
                const fileSize = new decimal_js_1.default(file.size);
                const fileSize_gb = new decimal_js_1.default(this.convertUnit(fileSize.toNumber(), 'B', 'GB'));
                console.log(fileSize_gb);
                console.log(storageUsed);
                console.log(storageUsed.plus(fileSize_gb));
                if (storageUsed.plus(fileSize_gb).gt(storageLimit)) {
                    throw new Error(`Upload exceeds storage limit. Used: ${storageUsed.toString()} GB, Limit: ${storageLimit.toString()} GB, File size: ${fileSize.toString()} bytes.`);
                }
                const response = await this.datahubService.uploadFile(folderpath, file);
                console.log('response', response);
                const CDN_BASE_URL = this.configService.get('CDN_BASE_URL');
                const bucketName = 'fotosfolio';
                const s3URL = response.downloadUrl;
                const size = this.convertUnit(file.size, 'B', 'GB');
                const upload = this.uploadRepository.create({
                    fileName: response.fileName,
                    mime_type: file.mimetype.toLowerCase(),
                    folder: folderpath,
                    downloadUrl: s3URL,
                    filesize: size,
                    folderId: folderId || '001',
                    projectId: projectId || '002',
                    s3Url: s3URL,
                });
                await this.uploadRepository.save(upload);
                await this.generateBlurPreview(upload.fileId);
                console.log('fileSize_mb', fileSize_gb);
                console.log('storageUsed', storageUsed);
                userStorage.storageUsed = storageUsed.plus(fileSize_gb).toString();
                console.log('new storage used', userStorage.storageUsed);
                await this.userStorageRepository.save(userStorage);
                return {
                    response,
                    upload,
                };
            }
            catch (error) {
                this.logger.error(`Attempt ${attempt} failed: ${error.message}`);
                if (attempt === 3) {
                    throw error;
                }
                await this.delay(1000 * attempt);
            }
        }
    }
    async uploadProjecttFile(file, userId, projectId, folderId, coverImg = false) {
        console.log(userId, projectId, folderId, coverImg);
        const user = await this.userRepository.findOne({ where: { id: userId } });
        console.log(user);
        if (!user) {
            throw new Error(`User with id ${userId} not found`);
        }
        const username = user.username;
        let folderPath = `${username}_${userId}`;
        if (projectId) {
            const project = await this.projectRepository.findOne({
                where: { id: projectId },
            });
            if (project) {
                const projectName = project.title;
                folderPath = `${folderPath}/${projectName}_${projectId}`;
            }
            else {
                throw new Error(`Project with id ${projectId} not found`);
            }
        }
        if (folderId) {
            const folder = await this.folderRepository.findOne({
                where: { id: folderId },
            });
            if (folder) {
                const folderName = folder.title;
                folderPath = `${folderPath}/${folderName}_${folderId}`;
            }
            else {
                throw new Error(`Folder with id ${folderId} not found`);
            }
        }
        if (coverImg) {
            folderPath = `${folderPath}/coverImg`;
        }
        const uploadResult = await this.uploadFile(file, folderPath, userId, folderId, projectId);
        return uploadResult;
    }
    async uploadMultipleFiles(files, folderPath, userId, projectId, folderId) {
        return await Promise.all(files.map((file) => this.uploadFile(file, folderPath, userId)));
    }
    async UploadMultipleProjectFiles(files, userId, projectId, folderId) {
        console.log('files', files);
        let userStorage = await this.userStorageRepository.findOne({
            where: { user: { id: userId } },
            relations: ['plan'],
        });
        if (!userStorage) {
            const subscription = await this.subscriptionRepository.findOne({
                where: { user: { id: userId } },
                relations: ['plan'],
            });
            if (!subscription?.plan) {
                throw new Error('No active subscription plan found for the user');
            }
            userStorage = await this.userStorageRepository.save(this.userStorageRepository.create({
                user: { id: userId },
                plan: { id: subscription.plan.id },
                storageUsed: '0',
            }));
        }
        const storageUsed = new decimal_js_1.default(userStorage.storageUsed || 0);
        const storageLimit = new decimal_js_1.default(userStorage.plan.storage);
        let totalUploadSizeBytes = 0;
        const successfulResults = [];
        for (let i = 0; i < files.length; i += 5) {
            const batch = files.slice(i, i + 5);
            const uploadResults = await Promise.allSettled(batch.map((file) => this.uploadProjecttFile(file, userId, projectId, folderId, false)));
            for (let j = 0; j < batch.length; j++) {
                const result = uploadResults[j];
                const file = batch[j];
                if (result.status === 'fulfilled') {
                    totalUploadSizeBytes += file.size;
                    successfulResults.push(result.value);
                }
                else {
                    console.error(`File ${file.originalname} failed to upload:`, result.reason);
                }
            }
        }
        const totalUploadSizeGB = new decimal_js_1.default(this.convertUnit(totalUploadSizeBytes, 'B', 'GB'));
        if (storageUsed.plus(totalUploadSizeGB).gt(storageLimit)) {
            throw new Error(`Batch upload exceeds your storage limit. Used: ${storageUsed.toString()} GB, ` +
                `Limit: ${storageLimit.toString()} GB, Batch size: ${totalUploadSizeGB.toString()} GB.`);
        }
        if (successfulResults.length > 0) {
            await this.userStorageRepository.increment({ user: { id: userId } }, 'storageUsed', totalUploadSizeGB.toNumber());
        }
        return successfulResults;
    }
    async deleteFile(fileId, userId) {
        try {
            const file = await this.uploadRepository.findOne({ where: { fileId } });
            console.log('deleting', fileId, userId);
            if (!file) {
                console.log('File not found');
                this.logger.log('notfound HttpException');
                throw new common_1.HttpException('File not found', common_1.HttpStatus.NOT_FOUND);
            }
            const fileName = file.fileName;
            const folder = file.folder;
            const filePath = node_path_1.default.join(folder, fileName);
            console.log('deleting', filePath);
            await this.datahubService.deleteFile(filePath);
            await this.uploadRepository.remove(file);
            const userStorage = await this.userStorageRepository.findOne({
                where: { user: { id: userId } },
            });
            if (userStorage) {
                const storageUsed = new decimal_js_1.default(userStorage.storageUsed);
                const fileSizeMB = new decimal_js_1.default(file.filesize);
                console.log(fileSizeMB);
                console.log(storageUsed);
                const updatedStorageUsed = storageUsed.minus(fileSizeMB);
                userStorage.storageUsed = updatedStorageUsed.toString();
                await this.userStorageRepository.save(userStorage);
            }
            this.logger.log(`File ${fileName} successfully deleted.`);
        }
        catch (error) {
            throw error;
        }
    }
    async deleteMultipleFiles(fileNames, userId) {
        if (!fileNames || fileNames.length === 0) {
            throw new Error('No file IDs provided for deletion');
        }
        return Promise.all(fileNames.map((fileName) => this.deleteFile(fileName, userId)));
    }
    async getFilesByFolderId(folderId) {
        return this.uploadRepository.find({ where: { folderId: folderId } });
    }
    async getFileByDownloadUrl(downloadUrl) {
        return await this.uploadRepository.findOne({
            where: { downloadUrl: downloadUrl },
        });
    }
    getExtension(filename) {
        if (!filename || typeof filename !== 'string')
            return '';
        const parts = filename.split('.');
        const ext = parts.length > 1 ? (parts.pop() ?? '') : '';
        return ext.toLowerCase();
    }
    async getImageFiles(folderId, page = 1, limit = 10) {
        const allFiles = await this.uploadRepository.find({ where: { folderId } });
        const imageFiles = allFiles.filter((file) => UploadService_1.IMAGE_EXTENSIONS.includes(this.getExtension(file.fileName)));
        const totalPages = Math.ceil(imageFiles.length / limit);
        const start = (page - 1) * limit;
        const data = imageFiles.slice(start, start + limit);
        return {
            data,
            page,
            totalPages,
        };
    }
    async getVideoFiles(folderId, page = 1, limit = 10) {
        const allFiles = await this.uploadRepository.find({ where: { folderId } });
        const videoFiles = allFiles.filter((file) => UploadService_1.VIDEO_EXTENSIONS.includes(this.getExtension(file.fileName)));
        const totalPages = Math.ceil(videoFiles.length / limit);
        const start = (page - 1) * limit;
        const data = videoFiles.slice(start, start + limit);
        return {
            data,
            page,
            totalPages,
        };
    }
    async getFilesByExtension(folderId, extension, page = 1, limit = 10) {
        const normalizedExtension = extension.toLowerCase();
        const allFiles = await this.uploadRepository.find({
            where: { mime_type: normalizedExtension },
        });
        const totalPages = Math.ceil(allFiles.length / limit);
        const start = (page - 1) * limit;
        const data = allFiles.slice(start, start + limit);
        return {
            data,
            page,
            totalPages,
        };
    }
    async createUserSession(userSession) {
        return await this.userSessionRepository.save(userSession);
    }
    async addUploadResponse(uploadResponse) {
        try {
            const uploadResult = this.uploadRepository.create(uploadResponse);
            const upload = await this.uploadRepository.save(uploadResult);
            if (uploadResponse.mime_type) {
                const existingExtension = await this.extensionRepository.findOne({
                    where: {
                        mime_type: uploadResponse.mime_type.toLowerCase(),
                        folder_id: uploadResponse.folderId,
                    },
                });
                if (!existingExtension) {
                    const extension = this.extensionRepository.create({
                        mime_type: uploadResponse.mime_type.toLowerCase(),
                        folder_id: uploadResponse.folderId,
                    });
                    await this.extensionRepository.save(extension);
                }
            }
            return this.generateBlurPreview(upload.fileId);
        }
        catch (error) {
            console.error('AddUploadResponse Error:', error);
            throw new Error('Failed to save upload response');
        }
    }
    async addMultipleUploadResponses(data) {
        try {
            const results = await Promise.all(data.files.map((file) => this.addUploadResponse(file)));
            return results;
        }
        catch (error) {
            console.error('AddMultipleUploadResponses Error:', error);
            throw new Error('Failed to save multiple upload responses');
        }
    }
    async softDeleteUpload(id) {
        const file = await this.uploadRepository
            .createQueryBuilder('upload')
            .where('upload.fileId = :id', { id })
            .addSelect([
            'upload.s3Url',
            'upload.fileId',
            'upload.fileName',
            'upload.friendlyUrl',
            'upload.downloadUrl',
            'upload.nativeUrl',
            'upload.folder',
            'upload.filesize',
            'upload.isFileSelected',
            'upload.folderId',
            'upload.projectId',
            'upload.isFileDeleted',
            'upload.deletedat',
            'upload.uploadedAt',
        ])
            .getOne();
        if (!file) {
            throw new common_1.HttpException('File not found', common_1.HttpStatus.NOT_FOUND);
        }
        file.isFileDeleted = true;
        file.deletedat = new Date();
        await this.uploadRepository.save(file);
        console.log(file);
        const trash = new trash_entity_1.Trash();
        Object.assign(trash, file);
        await this.trashRepository.save(trash);
        await this.uploadRepository.delete(id);
    }
    async softDeleteMultipleUploads(ids) {
        await Promise.all(ids.map((id) => this.softDeleteUpload(id)));
    }
    async recoverUpload(id) {
        const trashedFile = await this.trashRepository
            .createQueryBuilder('upload')
            .where('upload.fileId = :id', { id })
            .addSelect([
            'upload.s3Url',
            'upload.fileId',
            'upload.fileName',
            'upload.friendlyUrl',
            'upload.downloadUrl',
            'upload.nativeUrl',
            'upload.folder',
            'upload.filesize',
            'upload.isFileSelected',
            'upload.folderId',
            'upload.projectId',
            'upload.isFileDeleted',
            'upload.deletedat',
            'upload.uploadedAt',
        ])
            .getOne();
        if (!trashedFile) {
            throw new common_1.HttpException('File not found in trash', common_1.HttpStatus.NOT_FOUND);
        }
        trashedFile.isFileDeleted = false;
        trashedFile.deletedat = null;
        const recoveredUpload = this.uploadRepository.create(trashedFile);
        await this.uploadRepository.save(recoveredUpload);
        await this.trashRepository.delete(id);
    }
    async recoverMultipleUploads(ids) {
        await Promise.all(ids.map((id) => this.recoverUpload(id)));
    }
    async emptyTrashBin(fileIds, userId) {
        const ids = typeof fileIds === 'string' ? [fileIds] : fileIds;
        if (!ids.length) {
            throw new Error('No file IDs provided for emptying trash');
        }
        const trashedFiles = await this.trashRepository
            .createQueryBuilder('upload')
            .where('upload.fileId IN (:...ids)', { ids })
            .addSelect([
            'upload.s3Url',
            'upload.fileId',
            'upload.fileName',
            'upload.friendlyUrl',
            'upload.downloadUrl',
            'upload.nativeUrl',
            'upload.folder',
            'upload.filesize',
            'upload.isFileSelected',
            'upload.folderId',
            'upload.projectId',
            'upload.isFileDeleted',
            'upload.deletedat',
            'upload.uploadedAt',
        ])
            .getMany();
        if (!trashedFiles.length) {
            throw new Error('No matching files found in trash');
        }
        const failedDeletions = [];
        await Promise.all(trashedFiles.map(async (file) => {
            try {
                await this.deleteTrashFile(file.fileId, userId);
            }
            catch (error) {
                console.error(`Failed to delete file: ${file.fileName}`, error);
                failedDeletions.push(file.fileId);
            }
        }));
        const successfulFiles = trashedFiles.filter((file) => !failedDeletions.includes(file.fileId));
        const successfulIds = successfulFiles.map((file) => file.fileId);
        const totalSizeDeleted = successfulFiles.reduce((total, file) => total + (file.filesize || 0), 0);
        if (successfulIds.length) {
            await this.trashRepository.delete(successfulIds);
        }
        if (failedDeletions.length) {
            throw new Error(`Failed to delete some files: ${failedDeletions.join(', ')}`);
        }
        const userStorage = await this.userStorageRepository.findOne({
            where: { user: { id: userId } },
        });
        if (userStorage) {
            const storageUsed = new decimal_js_1.default(userStorage.storageUsed);
            const fileSizeMB = new decimal_js_1.default(totalSizeDeleted);
            console.log(fileSizeMB);
            console.log(storageUsed);
            const updatedStorageUsed = storageUsed.minus(fileSizeMB);
            userStorage.storageUsed = updatedStorageUsed.toString();
            console.log('storage before deletion', storageUsed);
            console.log('deleted files size', fileSizeMB);
            console.log('storage after deletion', updatedStorageUsed);
            await this.userStorageRepository.save(userStorage);
        }
    }
    async generateBlurPreview(fileId) {
        const image = await this.uploadRepository.findOne({
            where: { fileId: fileId },
        });
        if (!image) {
            throw new common_1.NotFoundException('Image not found');
        }
        const fileName = image.downloadUrl.replace(/^https:\/\/(s3-np1\.datahub\.com\.np\/fotosfolio|cdn\.fotosfolio\.com)\//, '');
        const downloadurl = await this.datahubService.generateGetPresignedUrl(fileName);
        const downloadUrl = downloadurl;
        console.log(downloadUrl);
        const mimeType = image.mime_type;
        if (mimeType.startsWith('image/')) {
            try {
                const response = await axios_1.default.get(downloadUrl, {
                    responseType: 'arraybuffer',
                });
                const imageBuffer = Buffer.from(response.data, 'binary');
                console.log('image fetched');
                const blurBuffer = await (0, sharp_1.default)(imageBuffer)
                    .resize(100, 100)
                    .blur()
                    .toBuffer();
                const previewBlurUrl = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;
                image.friendlyUrl = previewBlurUrl;
                return await this.uploadRepository.save(image);
            }
            catch (error) {
                throw new Error('Error while processing the image');
            }
        }
        else {
            throw new Error('The uploaded file is not an image');
        }
    }
    async changeFolderId(id, newFolderId) {
        const image = await this.uploadRepository.findOne({
            where: { fileId: id },
        });
        if (!image) {
            throw new common_1.NotFoundException('Image not found');
        }
        image.folderId = newFolderId;
        return await this.uploadRepository.save(image);
    }
    async changeMultipleFolderIds(data) {
        const fileIdMap = new Map(data.files.map((f) => [f.id, f.newFolderId]));
        const ids = Array.from(fileIdMap.keys());
        const images = await this.uploadRepository.find({
            where: { fileId: (0, typeorm_1.In)(ids) },
        });
        const foundIds = new Set(images.map((img) => img.fileId));
        const notFound = ids.filter((id) => !foundIds.has(id));
        if (notFound.length > 0) {
            throw new common_1.NotFoundException(`Images not found: ${notFound.join(', ')}`);
        }
        for (const image of images) {
            image.folderId = fileIdMap.get(image.fileId);
        }
        return await this.uploadRepository.save(images);
    }
    async getFileCountAndSize(projectId) {
        const files = await this.uploadRepository.find({
            where: { projectId },
        });
        const count = files.length;
        const size = files.reduce((acc, file) => acc + file.filesize, 0);
        return { count, size };
    }
    async deleteTrashFile(fileId, userId) {
        try {
            const file = await this.trashRepository.findOne({ where: { fileId } });
            if (!file) {
                throw new common_1.NotFoundException(`File with name ${fileId} not found`);
            }
            const fileName = file.fileName;
            const folder = file.folder;
            const filePath = node_path_1.default.join(folder, fileName);
            await this.datahubService.deleteFile(filePath);
            await this.uploadRepository.remove(file);
            this.logger.log(`File ${fileName} successfully deleted.`);
        }
        catch (error) {
            if (error.response) {
                this.logger.error('Backblaze API Error:', error.response.data);
            }
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }
    async getTrashFiles(projectId, page = 1, limit = 100) {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.HttpException('Project not found', common_1.HttpStatus.NOT_FOUND);
        }
        const [files, total] = await this.trashRepository.findAndCount({
            where: { projectId },
            skip: (page - 1) * limit,
            take: limit,
            order: { deletedat: 'DESC' },
        });
        await Promise.all(files.map(async (image) => {
            const filePath = `${image.folder}/${image.fileName}`;
            image.downloadUrl =
                await this.datahubService.generateGetPresignedUrl(filePath);
        }));
        return {
            data: files,
            total,
            page,
            limit,
        };
    }
    async getExtensionByFolderId(folderId) {
        const extensions = await this.extensionRepository
            .createQueryBuilder('extension')
            .distinctOn(['extension.mime_type'])
            .where('extension.folder_id = :folderId', { folderId })
            .getMany();
        if (extensions.length === 0) {
            return { message: 'No extension found' };
        }
        return extensions;
    }
    async addFileToPortfolioFolder(portfolioFolderId, fileIds) {
        const portfolioFolder = await this.folderRepository.findOne({
            where: { id: portfolioFolderId },
        });
        if (!portfolioFolder) {
            throw new common_1.HttpException('Portfolio folder not found', common_1.HttpStatus.NOT_FOUND);
        }
        const files = await this.uploadRepository.find({
            where: { fileId: (0, typeorm_1.In)(fileIds) },
        });
        if (files.length === 0) {
            throw new common_1.HttpException('No files found', common_1.HttpStatus.NOT_FOUND);
        }
        files.forEach((file) => {
            if (!file.portfolioFolderIds) {
                file.portfolioFolderIds = [];
            }
            if (!file.portfolioFolderIds.includes(portfolioFolderId)) {
                file.portfolioFolderIds.push(portfolioFolderId);
            }
        });
        await this.uploadRepository.save(files);
    }
};
UploadService.IMAGE_EXTENSIONS = [
    'arw',
    'cr2',
    'cr3',
    'nef',
    'nrw',
    'jpg',
    'jpeg',
    'png',
    'webp',
];
UploadService.VIDEO_EXTENSIONS = [
    'mp4',
    'mov',
    'avi',
    'mkv',
];
UploadService = UploadService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_2.InjectRepository)(upload_entity_1.Upload)),
    __param(3, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __param(4, (0, typeorm_2.InjectRepository)(project_entity_1.Project)),
    __param(5, (0, typeorm_2.InjectRepository)(userStorage_entity_1.UserStorage)),
    __param(6, (0, typeorm_2.InjectRepository)(subscription_entity_1.Subscription)),
    __param(7, (0, typeorm_2.InjectRepository)(folder_entity_1.Folder)),
    __param(9, (0, typeorm_2.InjectRepository)(user_session_entity_1.UserSession)),
    __param(11, (0, typeorm_2.InjectRepository)(trash_entity_1.Trash)),
    __param(12, (0, typeorm_2.InjectRepository)(extensions_entity_1.FileExtension)),
    __metadata("design:paramtypes", [config_1.ConfigService, typeof (_a = typeof backblaze_service_1.BackblazeService !== "undefined" && backblaze_service_1.BackblazeService) === "function" ? _a : Object, typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository, typeof (_b = typeof datahub_service_1.DatahubService !== "undefined" && datahub_service_1.DatahubService) === "function" ? _b : Object, typeorm_1.Repository, typeof (_c = typeof storage_service_1.StorageService !== "undefined" && storage_service_1.StorageService) === "function" ? _c : Object, typeorm_1.Repository,
        typeorm_1.Repository])
], UploadService);
exports.UploadService = UploadService;
//# sourceMappingURL=upload.service.js.map