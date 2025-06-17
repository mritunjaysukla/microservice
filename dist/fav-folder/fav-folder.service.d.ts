import { Repository } from 'typeorm';
import { FavoriteFolder } from './entity/fav-folder.entity';
import { FavoriteFile } from './entity/fav-files.entity';
import { UserService } from 'src/user/services/user/user.service';
import { UploadService } from 'src/upload/upload.service';
export declare class FavFolderService {
    private readonly favFolderRepository;
    private readonly favFileRepository;
    private readonly userService;
    private readonly uploadService;
    constructor(favFolderRepository: Repository<FavoriteFolder>, favFileRepository: Repository<FavoriteFile>, userService: UserService, uploadService: UploadService);
    createFavFolder(clientId: string, projectId: string, folderId: string, folderName: string): Promise<FavoriteFolder>;
    addFilesToFavFolder(favFolderId: string, fileIds: string[], userId: string): Promise<FavoriteFile[]>;
    getFavFolderById(id: string): Promise<FavoriteFolder | null>;
    removeFilesFromFav(favFolderId: string, fileIds: string | string[]): Promise<void>;
    getFavFoldersByUserId(req: any): Promise<FavoriteFolder[]>;
}
