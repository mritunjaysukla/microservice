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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialAccountService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const socialAccounts_entity_1 = require("./entity/socialAccounts.entity");
let SocialAccountService = class SocialAccountService {
    constructor(socialAccountRepository) {
        this.socialAccountRepository = socialAccountRepository;
    }
    async create(createSocialAccountDto) {
        const socialAccount = this.socialAccountRepository.create(createSocialAccountDto);
        return this.socialAccountRepository.save(socialAccount);
    }
    async findAll() {
        return this.socialAccountRepository.find();
    }
    async findOne(id) {
        const socialAccount = await this.socialAccountRepository.findOne({
            where: { id },
        });
        if (!socialAccount) {
            throw new common_1.NotFoundException(`Social account with ID ${id} not found`);
        }
        return socialAccount;
    }
    async update(id, updateSocialAccountDto) {
        const socialAccount = await this.findOne(id);
        Object.assign(socialAccount, updateSocialAccountDto);
        return this.socialAccountRepository.save(socialAccount);
    }
    async remove(id) {
        const socialAccount = await this.findOne(id);
        await this.socialAccountRepository.delete(socialAccount.id);
    }
};
SocialAccountService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(socialAccounts_entity_1.SocialAccount)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SocialAccountService);
exports.SocialAccountService = SocialAccountService;
//# sourceMappingURL=social-account.service.js.map