import { SharedUser } from './entity/shared-user.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Project } from '../project/entities/project.entity';
export declare class SharedUserService {
    private readonly sharedUserRepository;
    private readonly userRepository;
    private readonly projectRepository;
    constructor(sharedUserRepository: Repository<SharedUser>, userRepository: Repository<User>, projectRepository: Repository<Project>);
    createSharedUser({ userId, projectId, photographerId, clientId, }: {
        userId: string;
        projectId: string;
        photographerId: string;
        clientId?: string | null;
    }): Promise<SharedUser>;
    getClients(photographerId: string): Promise<User[]>;
    getSharedUsersByProjectId(projectId: string): Promise<{
        sharedBy: unknown;
        id: string;
        user: User;
        project: Project;
        clientId?: string;
        photographerId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
