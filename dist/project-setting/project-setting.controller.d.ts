import { ProjectSettingService } from './project-setting.service';
import { ProjectSetting } from './entity/project-setting.entity';
import { CreateProjectSettingDto } from './dto/create-project-setting.dto';
import { UpdateProjectSettingDto } from './dto/update-project-setting.dto';
export declare class ProjectSettingController {
    private readonly projectSettingService;
    constructor(projectSettingService: ProjectSettingService);
    create(createProjectSettingDto: CreateProjectSettingDto): Promise<ProjectSetting>;
    updatePasswordByProjectSettingId(newPwd: string, projectSettingId: string): Promise<ProjectSetting>;
    updateByProjectId(projectId: string, updateProjectSettingDto: UpdateProjectSettingDto): Promise<ProjectSetting>;
}
