import { Repository } from 'typeorm';
import { HelpCenter, HelpCenterSection } from './entity/help-center.entity';
import { CreateHelpCenterDto, UpdateHelpCenterDto } from './dto/create-helpcenter.dto';
export declare class HelpCenterService {
    private readonly helpCenterRepository;
    constructor(helpCenterRepository: Repository<HelpCenter>);
    createHelpCenter(helpCenter: CreateHelpCenterDto): Promise<HelpCenter>;
    updateHelpCenter(id: string, helpCenter: UpdateHelpCenterDto): Promise<{
        message: string;
        data?: HelpCenter;
    }>;
    getHelpCenterByCategory(category: HelpCenterSection): Promise<{
        message: string;
        data: HelpCenter[];
    }>;
    deleteHelpCenter(id: string): Promise<{
        message: string;
    }>;
}
