import { FavFolderService } from './fav-folder.service';
import { FavoriteFolder } from './entity/fav-folder.entity';
import { FavoriteFile } from './entity/fav-files.entity';
export declare class FavFolderController {
    private readonly favFolderService;
    constructor(favFolderService: FavFolderService);
    createFav(projectId: string, folderId: string, folderName: string, req: any): Promise<FavoriteFolder>;
    addFilesToFav(favFolderId: string, fileIds: string[], req: any): Promise<FavoriteFile[]>;
    getFavFolders(req: any): Promise<FavoriteFolder[]>;
    getFavById(id: string): Promise<FavoriteFolder | null>;
    removeFilesFromFavFolder(favFolderId: string, fileIds: string[]): Promise<void>;
}
