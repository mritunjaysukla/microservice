import { User } from '../../user/entities/user.entity';
import { Project } from '../../project/entities/project.entity';
export declare class SharedUser {
    id: string;
    user: User;
    project: Project;
    clientId?: string | null;
    photographerId: string;
    createdAt: Date;
    updatedAt: Date;
}
