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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycVerificationService = void 0;
const common_1 = require("@nestjs/common");
const kyc_user_entity_1 = require("./entity/kyc-user.entity");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const upload_service_1 = require("src/upload/upload.service");
const user_entity_1 = require("src/user/entities/user.entity");
const kyc_defaults_1 = require("./entity/kyc-defaults");
let KycVerificationService = class KycVerificationService {
    constructor(kycRepo, userRepo, uploadService) {
        this.kycRepo = kycRepo;
        this.userRepo = userRepo;
        this.uploadService = uploadService;
    }
    async handleFileDelete(oldFileUrl, userId) {
        if (oldFileUrl) {
            const oldFile = await this.uploadService.getFileByDownloadUrl(oldFileUrl);
            if (oldFile) {
                await this.uploadService.deleteFile(oldFile?.fileId, userId);
            }
        }
    }
    async updateKycField(userKyc, fieldName, dto) {
        console.log('dto', dto);
        let validFields = [];
        switch (fieldName) {
            case kyc_user_entity_1.ValidFields.BasicInformation:
                validFields = Object.keys(kyc_defaults_1.defaultBasicInformation);
                break;
            case kyc_user_entity_1.ValidFields.IdentityVerification:
                validFields = Object.keys(kyc_defaults_1.defaultIdentityVerification);
                break;
            case kyc_user_entity_1.ValidFields.BusinessInformation:
                validFields = Object.keys(kyc_defaults_1.defaultBusinessInformation);
                break;
            case kyc_user_entity_1.ValidFields.TermsAndSubmission:
                validFields = Object.keys(kyc_defaults_1.defaultTermsAndSubmission);
                break;
            default:
                throw new Error('Invalid field name');
        }
        const filteredDto = Object.fromEntries(Object.entries(dto).filter(([key, value]) => value !== undefined && validFields.includes(key)));
        const updatedUserKyc = {
            ...userKyc,
            [fieldName]: {
                ...(userKyc[fieldName] || {}),
                ...filteredDto,
            },
        };
        console.log(updatedUserKyc, fieldName);
        const savedUserKyc = await this.kycRepo.save(updatedUserKyc);
        console.log(savedUserKyc, fieldName);
        return savedUserKyc;
    }
    async submitKycField(userId, fieldName, dto, file1, file2) {
        console.log(dto);
        let newDto = {};
        if (dto?.dto && typeof dto.dto === 'string') {
            try {
                const cleanedJson = dto.dto
                    .replace(/,\s*}/g, '}')
                    .replace(/,\s*]/g, ']');
                newDto = JSON.parse(cleanedJson);
                console.log(newDto);
            }
            catch (err) {
                console.error('Failed to parse inner DTO:', err);
                throw new Error('Failed to parse inner DTO');
            }
        }
        else if (dto && typeof dto === 'object') {
            newDto = dto;
        }
        let userKyc = await this.kycRepo.findOne({
            where: { user: { id: userId } },
        });
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        const folderPrefix = `${user.username}_${user.id}/kyc`;
        if (fieldName === kyc_user_entity_1.ValidFields.BasicInformation && file1) {
            const basicInfo = userKyc?.basicInformation;
            console.log(basicInfo?.profilePicture);
            if (basicInfo?.profilePicture) {
                await this.handleFileDelete(basicInfo?.profilePicture, userId);
            }
            const uploadResult = await this.uploadService.uploadFile(file1, `${folderPrefix}/basic`, userId);
            newDto.profilePicture = uploadResult.response.downloadUrl;
        }
        else if (fieldName === kyc_user_entity_1.ValidFields.IdentityVerification &&
            file1 &&
            file2) {
            const identity = userKyc?.identityVerification;
            if (identity?.idFront) {
                await this.handleFileDelete(identity?.idFront, userId);
            }
            if (identity?.idBack) {
                await this.handleFileDelete(identity?.idBack, userId);
            }
            const frontUpload = await this.uploadService.uploadFile(file1, `${folderPrefix}/identity/front`, userId);
            const backUpload = await this.uploadService.uploadFile(file2, `${folderPrefix}/identity/back`, userId);
            newDto.idFront = frontUpload.response.downloadUrl;
            newDto.idBack = backUpload.response.downloadUrl;
        }
        else if (fieldName === kyc_user_entity_1.ValidFields.BusinessInformation && file1) {
            const business = userKyc?.businessInformation;
            if (business?.panDocument) {
                await this.handleFileDelete(business?.panDocument, userId);
            }
            const uploadResult = await this.uploadService.uploadFile(file1, `${folderPrefix}/business`, userId);
            newDto.panDocument = uploadResult.response.downloadUrl;
        }
        console.log('DTO typeof:', typeof dto.dto);
        console.log('DTO:', newDto);
        if (!userKyc) {
            const validDto = {};
            switch (fieldName) {
                case kyc_user_entity_1.ValidFields.BasicInformation:
                    const basicInfoFields = [
                        'fullName',
                        'dob',
                        'gender',
                        'label',
                        'contactNumber',
                        'country',
                        'city',
                        'address',
                        'profilePicture',
                    ];
                    basicInfoFields.forEach((field) => {
                        if (dto[field]) {
                            validDto[field] = dto[field];
                        }
                    });
                    break;
                case kyc_user_entity_1.ValidFields.IdentityVerification:
                    const identityInfoFields = [
                        'idType',
                        'idFront',
                        'idBack',
                        'idNumber',
                    ];
                    identityInfoFields.forEach((field) => {
                        if (dto[field]) {
                            validDto[field] = dto[field];
                        }
                    });
                    break;
                case kyc_user_entity_1.ValidFields.BusinessInformation:
                    const businessInfoFields = [
                        'businessName',
                        'businessType',
                        'panNumber',
                        'panDocument',
                        'businessAddress',
                        'hasBusiness',
                    ];
                    businessInfoFields.forEach((field) => {
                        if (dto[field]) {
                            validDto[field] = dto[field];
                        }
                    });
                    break;
                case kyc_user_entity_1.ValidFields.TermsAndSubmission:
                    const termsInfoFields = [
                        'terms',
                        'acceptance',
                    ];
                    termsInfoFields.forEach((field) => {
                        if (dto[field]) {
                            validDto[field] = dto[field];
                        }
                    });
                    break;
                default:
                    throw new Error('Invalid field name');
            }
            userKyc = this.kycRepo.create({
                [fieldName]: validDto,
                user: { id: userId },
            });
            userKyc = await this.kycRepo.save(userKyc);
        }
        else {
            userKyc = await this.updateKycField(userKyc, fieldName, newDto);
        }
        return userKyc;
    }
    async submitBasicInfo(userId, dto) {
        return this.submitKycField(userId, kyc_user_entity_1.ValidFields.BasicInformation, dto);
    }
    async submitBusinessInfo(userId, dto) {
        return this.submitKycField(userId, kyc_user_entity_1.ValidFields.BusinessInformation, dto);
    }
    async submitIdentityVerification(userId, dto) {
        return this.submitKycField(userId, kyc_user_entity_1.ValidFields.IdentityVerification, dto);
    }
    async submitTermsAndSubmission(userId, dto) {
        return this.submitKycField(userId, kyc_user_entity_1.ValidFields.TermsAndSubmission, dto);
    }
    async updateAdminRemarkAndKycStatus(userId, kycStatus, adminRemarks) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`User not found with userId ${userId}`);
        }
        let userKyc = await this.kycRepo.findOne({
            where: { user: { id: userId } },
        });
        if (!userKyc) {
            throw new Error('userkyc not found');
        }
        userKyc.kycStatus = kycStatus;
        if (adminRemarks) {
            userKyc.adminRemarks = adminRemarks;
        }
        const kyc = await this.kycRepo.save(userKyc);
        if (kyc.kycStatus === kyc_user_entity_1.KycStatus.APPROVED) {
            user.isKycVerified = true;
            await this.userRepo.save(user);
        }
        return kyc;
    }
    async getUserKyc(userId) {
        console.log('getUserKyc');
        const kyc = await this.kycRepo.findOne({
            where: { user: { id: userId } },
        });
        if (!kyc) {
            if (!kyc) {
                throw new common_1.NotFoundException(`Kyc not found with userId ${userId}`);
            }
        }
        return kyc;
    }
    async submitKyc(kycId) {
        const kyc = await this.kycRepo.findOne({ where: { id: kycId } });
        if (!kyc) {
            throw new common_1.NotFoundException(`Kyc not found with id ${kycId}`);
        }
        kyc.kycStatus = kyc_user_entity_1.KycStatus.SUBMITTED;
        await this.kycRepo.save(kyc);
        return kyc;
    }
    async getAllKycByStatus(status, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [kycList, total] = await this.kycRepo.findAndCount({
            where: { kycStatus: status },
            skip,
            take: limit,
        });
        if (!kycList || kycList.length === 0) {
            throw new common_1.NotFoundException(`No KYC found with status ${status}`);
        }
        return {
            data: kycList,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
};
KycVerificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(kyc_user_entity_1.Kyc_user)),
    __param(1, (0, typeorm_2.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        typeorm_1.Repository, typeof (_a = typeof upload_service_1.UploadService !== "undefined" && upload_service_1.UploadService) === "function" ? _a : Object])
], KycVerificationService);
exports.KycVerificationService = KycVerificationService;
//# sourceMappingURL=kyc-verification.service.js.map