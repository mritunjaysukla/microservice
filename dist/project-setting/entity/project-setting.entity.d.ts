import { Project } from '../../project/entities/project.entity';
export declare class ProjectSetting {
    id: string;
    photoSelection: boolean;
    downloadOriginalPhotos: boolean;
    watermark: boolean;
    showProduct: boolean;
    allowFeedback: boolean;
    requireCredentials: boolean;
    displayShareBtn: boolean;
    displayContactInfo: boolean;
    displayBusinessCard: boolean;
    displayTestimonials: boolean;
    requirePassword: boolean;
    password?: string;
    coverPhoto?: string | null;
    addedProducts: string[];
    projectId: string;
    project: Project;
}
