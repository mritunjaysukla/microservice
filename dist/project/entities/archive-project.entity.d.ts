import { BaseProject } from './base-project.entity';
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
export declare class ArchivedProject extends BaseProject {
}
