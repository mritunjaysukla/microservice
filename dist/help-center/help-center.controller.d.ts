import { HelpCenterService } from './help-center.service';
import { CreateHelpCenterDto, UpdateHelpCenterDto } from './dto/create-helpcenter.dto';
import { HelpCenter, HelpCenterSection } from './entity/help-center.entity';
export declare class HelpCenterController {
    private readonly helpCenterService;
    constructor(helpCenterService: HelpCenterService);
    createHelpCenter(helpCenter: CreateHelpCenterDto): Promise<HelpCenter>;
    getHelpCenterByCategory(category: HelpCenterSection): Promise<{
        message: string;
        data: HelpCenter[];
    }>;
    updateHelpCenter(id: string, helpCenter: UpdateHelpCenterDto): Promise<{
        message: string;
        data?: HelpCenter;
    }>;
    deleteHelpCenter(id: string): Promise<void>;
}
