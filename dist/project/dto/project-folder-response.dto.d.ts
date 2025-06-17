export declare class FolderResponseDto {
    id: string;
    title: string;
    description: string;
    eventDate: Date;
    location: string;
    coverImg: string;
    isSelected: boolean;
}
export declare class ProjectWithFoldersResponseDto {
    id: string;
    title: string;
    description: string;
    dateCompleted: Date;
    shootDate: Date;
    projectType: string;
    folders: FolderResponseDto[];
}
export declare class ProjectsWithFoldersResponseDto {
    projects: ProjectWithFoldersResponseDto[];
}
