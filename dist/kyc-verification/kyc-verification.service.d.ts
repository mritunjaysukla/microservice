/// <reference types="multer" />
import { Kyc_user, KycStatus, ValidFields } from './entity/kyc-user.entity';
import { Repository } from 'typeorm';
import { BasicInformation } from './dto/basic-info.dto';
import { businessInformation } from './dto/business-info.dto';
import { IdentityVerification } from './dto/identity-verification.dto';
import { TermsAndSubmission } from './dto/terms-submission.dto';
import { UploadService } from 'src/upload/upload.service';
import { User } from 'src/user/entities/user.entity';
export declare class KycVerificationService {
    private readonly kycRepo;
    private readonly userRepo;
    private readonly uploadService;
    constructor(kycRepo: Repository<Kyc_user>, userRepo: Repository<User>, uploadService: UploadService);
    private handleFileDelete;
    private updateKycField;
    submitKycField(userId: string, fieldName: ValidFields, dto: any, file1?: Express.Multer.File, file2?: Express.Multer.File): Promise<Kyc_user>;
    submitBasicInfo(userId: string, dto: BasicInformation): Promise<Kyc_user>;
    submitBusinessInfo(userId: string, dto: businessInformation): Promise<Kyc_user>;
    submitIdentityVerification(userId: string, dto: IdentityVerification): Promise<Kyc_user>;
    submitTermsAndSubmission(userId: string, dto: TermsAndSubmission): Promise<Kyc_user>;
    updateAdminRemarkAndKycStatus(userId: string, kycStatus: KycStatus, adminRemarks?: string): Promise<Kyc_user>;
    getUserKyc(userId: string): Promise<Kyc_user>;
    submitKyc(kycId: string): Promise<Kyc_user>;
    getAllKycByStatus(status: KycStatus, page?: number, limit?: number): Promise<{
        data: Kyc_user[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
