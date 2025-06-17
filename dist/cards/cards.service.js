"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cards_entity_1 = require("./entity/cards.entity");
const typeorm_2 = require("typeorm");
const upload_service_1 = require("src/upload/upload.service");
const common_2 = require("@nestjs/common");
const user_entity_1 = require("src/user/entities/user.entity");
let CardsService = class CardsService {
    constructor(cardsRepository, usersRepository, uploadService) {
        this.cardsRepository = cardsRepository;
        this.usersRepository = usersRepository;
        this.uploadService = uploadService;
    }
    async create(businessLogo, { phoneNumber, location, email, website, template, qrUrl }, req) {
        try {
            const userId = req.user.id;
            const userName = req.user.username;
            const user = await this.usersRepository.findOne({
                where: { id: userId },
            });
            if (!user) {
                throw new common_2.BadRequestException('User not found');
            }
            const folderPath = `${userName}_${userId}/Logo`;
            if (!businessLogo) {
                throw new common_2.BadRequestException('Business logo is required');
            }
            const uploadResult = await this.uploadService.uploadFile(businessLogo, folderPath, userId);
            const businessLogoUrl = uploadResult.downloadUrl;
            const newCard = this.cardsRepository.create({
                businessLogoUrl,
                phoneNumber,
                location,
                email,
                website,
                qrUrl,
                template,
                users: [user],
            });
            return await this.cardsRepository.save(newCard);
        }
        catch (error) {
            if (error instanceof common_2.BadRequestException) {
                throw error;
            }
            throw new common_2.InternalServerErrorException('Something went wrong while creating the card');
        }
    }
    async findAll() {
        try {
            const cards = await this.cardsRepository.find();
            return cards;
        }
        catch (error) {
            throw new common_2.InternalServerErrorException('Something went wrong while fetching cards');
        }
    }
    async findOne(id) {
        try {
            const card = await this.cardsRepository.findOne({ where: { id } });
            if (!card) {
                throw new common_2.NotFoundException('Card not found');
            }
            return card;
        }
        catch (error) {
            throw new common_2.InternalServerErrorException('Something went wrong while fetching the card');
        }
    }
    async update(id, businessLogo, updateCardDto, req) {
        try {
            const card = await this.cardsRepository.findOne({ where: { id } });
            if (!card) {
                throw new common_2.NotFoundException('Card not found');
            }
            const userId = req.user.id;
            let businessLogoUrl = card.businessLogoUrl;
            if (businessLogo) {
                const folderPath = `${req.user.username}_${req.user.id}/Logo`;
                const uploadResult = await this.uploadService.uploadFile(businessLogo, folderPath, userId);
                businessLogoUrl = uploadResult.downloadUrl;
            }
            const updatedCard = {
                ...card,
                ...updateCardDto,
                businessLogoUrl,
            };
            return await this.cardsRepository.save(updatedCard);
        }
        catch (error) {
            throw new common_2.InternalServerErrorException('Something went wrong while updating the card');
        }
    }
    async remove(id) {
        try {
            const card = await this.cardsRepository.findOne({ where: { id } });
            if (!card) {
                throw new common_2.NotFoundException('Card not found');
            }
            await this.cardsRepository.remove(card);
            return { message: 'Card deleted successfully' };
        }
        catch (error) {
            throw new common_2.InternalServerErrorException('Something went wrong while deleting the card');
        }
    }
};
CardsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cards_entity_1.Cards)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof upload_service_1.UploadService !== "undefined" && upload_service_1.UploadService) === "function" ? _a : Object])
], CardsService);
exports.CardsService = CardsService;
//# sourceMappingURL=cards.service.js.map