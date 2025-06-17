/// <reference types="multer" />
import { KycVerificationService } from './kyc-verification.service';
import { KycStatus, ValidFields } from './entity/kyc-user.entity';
export declare class KycVerificationController {
    private readonly kycUserService;
    constructor(kycUserService: KycVerificationService);
    getUserKycByuserId(userId: string): Promise<import("./entity/kyc-user.entity").Kyc_user>;
    updateKycStatus(kycId: string): Promise<import("./entity/kyc-user.entity").Kyc_user>;
    getUserKyc(userId: string): Promise<import("./entity/kyc-user.entity").Kyc_user>;
    submitKycInfo(id: string, fieldName: ValidFields, dto: any, files: {
        file1?: Express.Multer.File[];
        file2?: Express.Multer.File[];
    }): Promise<import("./entity/kyc-user.entity").Kyc_user>;
    updateAdminRemarkAndKycStatus(id: string, kycStatus: KycStatus, adminRemarks?: string): Promise<{
        message: string;
        data: import("./entity/kyc-user.entity").Kyc_user;
    }>;
    getKycByStatus(status: KycStatus, page?: number, limit?: number): Promise<{
        data: import("./entity/kyc-user.entity").Kyc_user[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
