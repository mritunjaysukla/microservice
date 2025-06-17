import { OnModuleInit } from '@nestjs/common';
import { ProjectsService } from 'src/project/projects.service';
import { SubscriptionService } from 'src/subscription/subscription.service';
export declare class ProjectCleanupService implements OnModuleInit {
    private readonly projectService;
    private readonly subscriptionService;
    private readonly logger;
    constructor(projectService: ProjectsService, subscriptionService: SubscriptionService);
    onModuleInit(): void;
    deleteExpiredProjects(): Promise<void>;
}
