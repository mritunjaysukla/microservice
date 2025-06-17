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
exports.SharedUserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const shared_user_entity_1 = require("./entity/shared-user.entity");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../user/entities/user.entity");
const project_entity_1 = require("../project/entities/project.entity");
let SharedUserService = class SharedUserService {
    constructor(sharedUserRepository, userRepository, projectRepository) {
        this.sharedUserRepository = sharedUserRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }
    async createSharedUser({ userId, projectId, photographerId, clientId, }) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
        });
        if (!user || !project) {
            throw new Error('User or Project not found');
        }
        const sharedUser = this.sharedUserRepository.create({
            user,
            project,
            clientId: clientId || null,
            photographerId,
        });
        await this.sharedUserRepository.save(sharedUser);
        return sharedUser;
    }
    async getClients(photographerId) {
        const sharedUsers = await this.sharedUserRepository.find({
            where: { photographerId },
            relations: ['user'],
        });
        if (!sharedUsers.length) {
            throw new common_1.NotFoundException('No  clients found for this photographer');
        }
        const clientIds = [...new Set(sharedUsers.map((su) => su.user.id))];
        const clients = await this.userRepository.find({
            where: {
                id: (0, typeorm_2.In)(clientIds),
            },
        });
        return clients;
    }
    async getSharedUsersByProjectId(projectId) {
        const sharedUsers = await this.sharedUserRepository.find({
            where: { project: { id: projectId } },
            relations: ['user'],
        });
        const clientIds = [
            ...new Set(sharedUsers
                .filter((su) => su.clientId !== null)
                .map((su) => su.clientId)),
        ];
        const photographerIds = [
            ...new Set(sharedUsers.map((su) => su.photographerId)),
        ];
        const [clientUsers, photographerUsers] = await Promise.all([
            clientIds.length > 0
                ? this.userRepository.find({
                    select: ['id', 'name', 'email', 'role'],
                    where: { id: (0, typeorm_2.In)(clientIds) },
                })
                : [],
            this.userRepository.find({
                select: ['id', 'name', 'email', 'role'],
                where: { id: (0, typeorm_2.In)(photographerIds) },
            }),
        ]);
        const clientMap = new Map(clientUsers.map((user) => [user.id, user]));
        const photographerMap = new Map(photographerUsers.map((user) => [user.id, user]));
        return sharedUsers.map((sharedUser) => {
            const sharedBy = sharedUser.clientId && clientMap.get(sharedUser.clientId)
                ? clientMap.get(sharedUser.clientId)
                : photographerMap.get(sharedUser.photographerId);
            const result = {
                ...sharedUser,
                sharedBy: sharedBy || null,
            };
            return result;
        });
    }
};
SharedUserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(shared_user_entity_1.SharedUser)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SharedUserService);
exports.SharedUserService = SharedUserService;
//# sourceMappingURL=shared-user.service.js.map