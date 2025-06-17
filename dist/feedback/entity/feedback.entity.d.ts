import { User } from '../../user/entities/user.entity';
import { Project } from '../../project/entities/project.entity';
export declare class Feedback {
    id: string;
    clientName: string;
    comment: string;
    rating: number;
    isSelectedForClient: boolean;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    project: Project;
}
