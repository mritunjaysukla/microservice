import { User } from '../../user/entities/user.entity';
import { Folder } from '../../folder/entity/folder.entity';
import { Feedback } from '../../feedback/entity/feedback.entity';
import { ProjectSetting } from '../../project-setting/entity/project-setting.entity';
import { GallerySetting } from '../../gallery-setting/entity/gallery-setting.entity';
import { SharedUser } from '../../shared-user/entity/shared-user.entity';
import { Product } from '../../products/entity/product.entity';
export declare enum StorageType {
    MONTHLY = "monthly",
    FOREVER = "forever"
}
export declare enum ProjectType {
    Wedding = "Wedding",
    Engagement = "Engagement",
    Portrait = "Portrait",
    Family = "Family",
    Maternity = "Maternity",
    Newborn = "Newborn",
    Graduation = "Graduation",
    Birthday = "Birthday",
    Corporate = "Corporate",
    Event = "Event",
    Product = "Product",
    Fashion = "Fashion",
    Travel = "Travel",
    Sports = "Sports",
    Architecture = "Architecture",
    FineArt = "Fine Art",
    Personal = "Personal",
    Other = "Other"
}
export declare abstract class BaseProject {
    id: string;
    title: string;
    projectType: ProjectType;
    allowedIps?: string[];
    description?: string;
    dateCompleted?: Date;
    shootDate?: Date;
    storageType: StorageType;
    deleted: boolean;
    timeline?: number;
    views?: number;
    downloads?: number;
    expiryDate?: Date;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    gallerySettingId: string;
    projectSettingId: string;
    folderId: string[];
    user: User;
    folders: Folder[];
    feedbacks: Feedback[];
    projectSetting: ProjectSetting;
    gallerySetting: GallerySetting;
    sharedUsers: SharedUser[];
    products: Product[];
}
