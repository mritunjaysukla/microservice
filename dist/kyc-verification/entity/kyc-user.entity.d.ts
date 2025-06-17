import { User } from '../../user/entities/user.entity';
export declare enum KycStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    SUBMITTED = "submitted"
}
export declare enum ValidFields {
    BasicInformation = "basicInformation",
    BusinessInformation = "businessInformation",
    IdentityVerification = "identityVerification",
    TermsAndSubmission = "termsAndSubmission"
}
export declare enum ValidDto {
    BasicInformation = "BasicInformation",
    BusinessInformation = "businessInformation",
    IdentityVerification = "IdentityVerification",
    TermsAndSubmission = "TermsAndSubmission"
}
export declare class Kyc_user {
    id: string;
    basicInformation: object;
    identityVerification: object;
    businessInformation: object;
    termsAndSubmission: object;
    kycStatus: KycStatus;
    adminRemarks: string;
    user: User;
}
