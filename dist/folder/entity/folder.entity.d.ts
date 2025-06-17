import { Project } from '../../project/entities/project.entity';
export declare enum FolderCategory {
    RAW_FILES = "Raw Files",
    EDITED_PHOTOS = "Edited Photos",
    TO_BE_REVIEWED = "To Be Reviewed",
    APPROVED_PHOTOS = "Approved Photos",
    REVISIONS_REQUESTED = "Revisions Requested",
    BEHIND_THE_SCENES = "Behind the Scenes",
    DOCUMENTS_CONTRACTS = "Documents & Contracts",
    INSPIRATION_MOODBOARD = "Inspiration / Moodboard",
    SOCIAL_MEDIA_VERSIONS = "Social Media Versions",
    HIGHLIGHTS_FEATURED = "Highlights / Featured"
}
export declare class Folder {
    id: string;
    title: string;
    userId: string;
    folderCategory: FolderCategory;
    description?: string;
    eventDate?: Date;
    location?: string;
    coverImg?: string;
    isSelected: boolean;
    isAdded: boolean;
    project: Project;
}
