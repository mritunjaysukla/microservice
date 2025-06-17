import { SharedUserService } from './shared-user.service';
export declare class SharedUserController {
    private readonly sharedUserService;
    constructor(sharedUserService: SharedUserService);
    getClients(photographerId: string): Promise<import("../user/entities/user.entity").User[]>;
    getSharedUsersByProjectId(projectId: string): Promise<{
        sharedBy: unknown;
        id: string;
        user: import("../user/entities/user.entity").User;
        project: import("../project/entities/project.entity").Project;
        clientId?: string;
        photographerId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
}
