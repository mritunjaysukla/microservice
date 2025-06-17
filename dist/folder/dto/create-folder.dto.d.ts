import { FolderCategory } from '../entity/folder.entity';
export declare class CreateFolderDto {
    title: string;
    folderCategory: FolderCategory;
    description?: string;
    eventDate?: Date;
    location?: string;
    projectId: string;
}
