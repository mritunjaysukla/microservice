declare enum Templates {
    TEMP1 = "temp1",
    TEMP2 = "temp2"
}
export declare class BusinessCardDto {
    phoneNumber: string;
    location: string;
    email: string;
    website: string;
    template: Templates;
    qrUrl: string;
}
export {};
