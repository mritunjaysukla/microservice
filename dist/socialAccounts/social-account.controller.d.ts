import { SocialAccountService } from './social-account.service';
import { CreateSocialAccountDto } from './dto/create-socialaccount.dto';
import { UpdateSocialAccountDto } from './dto/update-socialaccount.dto';
import { SocialAccount } from './entity/socialAccounts.entity';
export declare class SocialAccountController {
    private readonly socialAccountService;
    constructor(socialAccountService: SocialAccountService);
    create(createSocialAccountDto: CreateSocialAccountDto): Promise<SocialAccount>;
    findAll(): Promise<SocialAccount[]>;
    findOne(id: string): Promise<SocialAccount>;
    update(id: string, updateSocialAccountDto: UpdateSocialAccountDto): Promise<SocialAccount>;
    remove(id: string): Promise<void>;
}
