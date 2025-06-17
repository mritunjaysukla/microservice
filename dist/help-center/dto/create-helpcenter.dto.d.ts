import { HelpCenterSection } from '../entity/help-center.entity';
export declare class CreateHelpCenterDto {
    category: HelpCenterSection;
    title: string;
    description: string;
    videoUrl: string;
}
declare const UpdateHelpCenterDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateHelpCenterDto>>;
export declare class UpdateHelpCenterDto extends UpdateHelpCenterDto_base {
}
export {};
