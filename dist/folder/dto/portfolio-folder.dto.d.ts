import { FolderCategory } from '../entity/folder.entity';
export declare class CreatePortfolioFolderDto {
    title: string;
    folderCategory: FolderCategory;
    description?: string;
    coverImg?: string;
    eventDate?: Date;
}
export declare class UpdatePortfolioFolderDto extends CreatePortfolioFolderDto {
}
