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
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entity/product.entity");
const upload_service_1 = require("src/upload/upload.service");
const project_setting_entity_1 = require("src/project-setting/entity/project-setting.entity");
const datahub_service_1 = require("src/datahub/datahub.service");
let ProductService = class ProductService {
    constructor(productRepository, UploadService, settingRepo, datahubService) {
        this.productRepository = productRepository;
        this.UploadService = UploadService;
        this.settingRepo = settingRepo;
        this.datahubService = datahubService;
    }
    async create(data, files, req) {
        const userId = req.user.id;
        const userName = req.user.username;
        const folderPath = `${userName}_${userId}/products`;
        console.log('Folder Path:', folderPath);
        const images = await this.UploadService.uploadMultipleFiles(files, folderPath, userId);
        console.log('Images:', images);
        const imageUrls = images.map((image) => image.upload.downloadUrl);
        const fileIds = images.map((image) => image.upload.fileId);
        console.log('Image URLs:', imageUrls);
        console.log('File IDs:', fileIds);
        const product = this.productRepository.create({
            ...data,
            images: imageUrls,
            fileId: fileIds,
            userId,
        });
        return this.productRepository.save(product);
    }
    async findAll(page = 1, limit = 10, userId) {
        const [items, total] = await this.productRepository.findAndCount({
            where: { userId },
            skip: (page - 1) * limit,
            take: limit,
        });
        await Promise.all(items.map(async (item) => {
            if (item.images && item.images.length > 0) {
                const presignedUrls = [];
                for (const fileId of item.images) {
                    console.log('File ID:', fileId);
                    const fileName = fileId.replace(/^https:\/\/(s3-np1\.datahub\.com\.np\/fotosfolio|cdn\.fotosfolio\.com)\//, '');
                    console.log('File Name:', fileName);
                    const url = await this.datahubService.generateGetPresignedUrl(fileName);
                    presignedUrls.push(url);
                }
                item.images = presignedUrls;
            }
            else {
                item.images = [];
            }
        }));
        console.log('Items:', items);
        return { items, total };
    }
    async findOne(id) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.images && product.images.length > 0) {
            const presignedUrls = [];
            for (const fileId of product.images) {
                console.log('File ID:', fileId);
                const fileName = fileId.replace(/^https:\/\/(s3-np1\.datahub\.com\.np\/fotosfolio|cdn\.fotosfolio\.com)\//, '');
                console.log('File Name:', fileName);
                const url = await this.datahubService.generateGetPresignedUrl(fileName);
                presignedUrls.push(url);
            }
            product.images = presignedUrls;
        }
        return product;
    }
    async update(id, data, files, req) {
        const product = await this.findOne(id);
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const userId = req.user.id;
        const userName = req.user.username;
        const folderPath = `${userName}_${userId}/products`;
        if (files && files.length > 0) {
            console.log(' files received');
            const fileIds = product.fileId;
            console.log('File IDs:', fileIds);
            if (fileIds.length > 0) {
                await this.UploadService.deleteMultipleFiles(fileIds, userId);
            }
            const uploadedImages = await this.UploadService.uploadMultipleFiles(files, folderPath, userId);
            const imageUrls = uploadedImages.map((image) => image.upload.downloadUrl);
            const newFileIds = uploadedImages.map((image) => image.upload.fileId);
            product.fileId = newFileIds;
            product.images = imageUrls;
            console.log(product.fileId, product.images);
        }
        const updatedData = {
            ...data,
            fileId: product.fileId,
            imageUrls: product.images,
        };
        Object.assign(product, updatedData);
        return await this.productRepository.save(product);
    }
    async delete(id, userId) {
        console.log('Deleting product with ID:', id);
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.fileId && product.fileId.length > 0) {
            await this.UploadService.deleteMultipleFiles(product.fileId, userId);
        }
        await this.productRepository.delete(id);
        const productId = '123e4567-e89b-12d3-a456-426614174000';
        const projectSettings = await this.settingRepo.find({
            where: {
                addedProducts: (0, typeorm_2.Raw)((alias) => `'${id}' = ANY(${alias})`),
            },
        });
        const updatePromises = projectSettings.map(async (setting) => {
            setting.addedProducts = setting.addedProducts.filter((productId) => productId !== id);
            return this.settingRepo.save(setting);
        });
        await Promise.all(updatePromises);
        console.log(projectSettings);
        return { message: 'Product deleted successfully' };
    }
    async findProductByUser(userId, page = 1, pageSize = 10) {
        const skip = (page - 1) * pageSize;
        const [items, total] = await this.productRepository.findAndCount({
            where: { userId },
            skip: (page - 1) * pageSize,
            take: pageSize,
        });
        await Promise.all(items.map(async (item) => {
            if (item.images && item.images.length > 0) {
                const presignedUrls = [];
                for (const fileId of item.images) {
                    console.log('File ID:', fileId);
                    const fileName = fileId.replace(/^https:\/\/(s3-np1\.datahub\.com\.np\/fotosfolio|cdn\.fotosfolio\.com)\//, '');
                    console.log('File Name:', fileName);
                    const url = await this.datahubService.generateGetPresignedUrl(fileName);
                    presignedUrls.push(url);
                }
                item.images = presignedUrls;
            }
            else {
                item.images = [];
            }
        }));
        return { items, total };
    }
};
ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(project_setting_entity_1.ProjectSetting)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeof (_a = typeof upload_service_1.UploadService !== "undefined" && upload_service_1.UploadService) === "function" ? _a : Object, typeorm_2.Repository, typeof (_b = typeof datahub_service_1.DatahubService !== "undefined" && datahub_service_1.DatahubService) === "function" ? _b : Object])
], ProductService);
exports.ProductService = ProductService;
//# sourceMappingURL=products.service.js.map