import { Repository } from 'typeorm';
import { SocialAccount } from './entity/socialAccounts.entity';
import { CreateSocialAccountDto } from './dto/create-socialaccount.dto';
import { UpdateSocialAccountDto } from './dto/update-socialaccount.dto';
export declare class SocialAccountService {
    private socialAccountRepository;
    constructor(socialAccountRepository: Repository<SocialAccount>);
    create(createSocialAccountDto: CreateSocialAccountDto): Promise<SocialAccount>;
    findAll(): Promise<SocialAccount[]>;
    findOne(id: string): Promise<SocialAccount>;
    update(id: string, updateSocialAccountDto: UpdateSocialAccountDto): Promise<SocialAccount>;
    remove(id: string): Promise<void>;
}
