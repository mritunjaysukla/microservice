import { User } from '../../user/entities/user.entity';
declare enum Templates {
    TEMP1 = "temp1",
    TEMP2 = "temp2"
}
export declare class Cards {
    id: string;
    businessLogoUrl: string;
    phoneNumber: string;
    location: string;
    email: string;
    website: string;
    qrUrl: string;
    template: Templates;
    users: User[];
}
export {};
