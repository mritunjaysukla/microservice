import { ProjectSetting } from './entity/project-setting.entity';
import { CreateProjectSettingDto } from './dto/create-project-setting.dto';
import { Repository } from 'typeorm';
import { UpdateProjectSettingDto } from './dto/update-project-setting.dto';
import { Project } from 'src/project/entities/project.entity';
import { PasswordService } from 'src/user/services/password/password.service';
export declare class ProjectSettingService {
    private readonly projectSettingRepository;
    private readonly projectRepository;
    private readonly passwordService;
    constructor(projectSettingRepository: Repository<ProjectSetting>, projectRepository: Repository<Project>, passwordService: PasswordService);
    create(createProjectSettingDto: CreateProjectSettingDto): Promise<ProjectSetting>;
    projectExist(id: string): Promise<boolean>;
    updateByProjectId(projectId: string, updateProjectSettingDto: UpdateProjectSettingDto): Promise<ProjectSetting>;
    changePwd(settingId: string, newPwd: string): Promise<ProjectSetting>;
}
