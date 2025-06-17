import { User } from '../../user/entities/user.entity';
import { FavoriteFile } from './fav-files.entity';
export declare class FavoriteFolder {
    id: string;
    folder_name: string;
    project_id: string;
    folder_id: string;
    user: User;
    files: FavoriteFile[];
}
