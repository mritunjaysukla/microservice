import { WatermarkOptions } from '../entity/site-setting.entity';
export declare class CreateSiteSettingDto {
    watermark?: WatermarkOptions;
    userAgreement?: string;
    legalAgreement?: string;
    publishUserAgreement?: boolean;
    publishLegalAgreement?: boolean;
}
