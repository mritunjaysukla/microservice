/// <reference types="multer" />
import { CardsService } from './cards.service';
import { BusinessCardDto } from './dtos/create-cards.dto';
import { UpdateCardDto } from './dtos/update-cards.dto';
export declare class CardsController {
    private readonly cardsService;
    constructor(cardsService: CardsService);
    createCard(businessLogo: Express.Multer.File, createCardDto: BusinessCardDto, req: any): Promise<import("./entity/cards.entity").Cards>;
    findAllCards(): Promise<import("./entity/cards.entity").Cards[]>;
    findOneCard(id: string): Promise<import("./entity/cards.entity").Cards>;
    updateCard(id: string, businessLogo: Express.Multer.File, updateCardDto: UpdateCardDto, req: any): Promise<import("./entity/cards.entity").Cards>;
    removeCard(id: string): Promise<{
        message: string;
    }>;
}
