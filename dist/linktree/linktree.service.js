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
exports.LinktreeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("src/user/entities/user.entity");
const linktree_entity_1 = require("./entity/linktree.entity");
let LinktreeService = class LinktreeService {
    constructor(linktreeRepo, userRepo) {
        this.linktreeRepo = linktreeRepo;
        this.userRepo = userRepo;
    }
    async create(dto) {
        const user = await this.userRepo.findOneBy({ id: dto.userId });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const existing = await this.linktreeRepo.findOne({
            where: { user: { id: user.id } },
        });
        if (existing)
            throw new common_1.ConflictException('Linktree already exists for this user');
        const linktree = this.linktreeRepo.create({
            message: dto.message,
            coverImage: dto.coverImage,
            profileImage: dto.profileImage,
            links: dto.links,
            user,
        });
        return this.linktreeRepo.save(linktree);
    }
    async findAll() {
        return this.linktreeRepo.find();
    }
    async findOne(id) {
        const linktree = await this.linktreeRepo.findOne({ where: { id } });
        if (!linktree)
            throw new common_1.NotFoundException('Linktree not found');
        return linktree;
    }
    async update(userId, dto) {
        const linktree = await this.linktreeRepo.findOne({
            where: { user: { id: userId } },
        });
        if (!linktree)
            throw new common_1.NotFoundException('Linktree not found for this user');
        linktree.message = dto.message ?? linktree.message;
        linktree.coverImage = dto.coverImage ?? linktree.coverImage;
        linktree.profileImage = dto.profileImage ?? linktree.profileImage;
        if (dto.links) {
            linktree.links = dto.links;
        }
        return this.linktreeRepo.save(linktree);
    }
    async remove(id) {
        const result = await this.linktreeRepo.delete(id);
        if (result.affected === 0)
            throw new common_1.NotFoundException('Linktree not found');
    }
    async findByUser(username) {
        const linktree = await this.linktreeRepo.findOne({
            where: { user: { username: username } },
            relations: ['user'],
        });
        if (!linktree)
            throw new common_1.NotFoundException('Linktree not found for user');
        if (linktree.user) {
            linktree.user = { username: linktree.user.username };
        }
        return linktree;
    }
};
LinktreeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(linktree_entity_1.Linktree)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], LinktreeService);
exports.LinktreeService = LinktreeService;
//# sourceMappingURL=linktree.service.js.map