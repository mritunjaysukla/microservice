/// <reference types="multer" />
import { Cards } from './entity/cards.entity';
import { Repository } from 'typeorm';
import { UploadService } from 'src/upload/upload.service';
import { BusinessCardDto } from './dtos/create-cards.dto';
import { UpdateCardDto } from './dtos/update-cards.dto';
import { User } from 'src/user/entities/user.entity';
export declare class CardsService {
    private cardsRepository;
    private usersRepository;
    private uploadService;
    constructor(cardsRepository: Repository<Cards>, usersRepository: Repository<User>, uploadService: UploadService);
    create(businessLogo: Express.Multer.File, { phoneNumber, location, email, website, template, qrUrl }: BusinessCardDto, req: any): Promise<Cards>;
    findAll(): Promise<Cards[]>;
    findOne(id: string): Promise<Cards>;
    update(id: string, businessLogo: Express.Multer.File, updateCardDto: UpdateCardDto, req: any): Promise<Cards>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
