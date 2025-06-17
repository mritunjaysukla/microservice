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
exports.FeedbackService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const feedback_entity_1 = require("./entity/feedback.entity");
const user_entity_1 = require("src/user/entities/user.entity");
const project_entity_1 = require("src/project/entities/project.entity");
let FeedbackService = class FeedbackService {
    constructor(feedbackRepository, userRepository, projectRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
        this.projectRepository = projectRepository;
    }
    async create(dto) {
        const user = await this.userRepository.findOne({
            where: { id: dto.userId },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        let project = undefined;
        if (dto.projectId) {
            project =
                (await this.projectRepository.findOne({
                    where: { id: dto.projectId },
                })) || undefined;
            if (!project)
                throw new common_1.NotFoundException('Project not found');
        }
        const feedback = this.feedbackRepository.create({
            ...dto,
            user: { id: user.id },
            project: project ? { id: project.id } : undefined,
        });
        return this.feedbackRepository.save(feedback);
    }
    async findAll(projectId) {
        return this.feedbackRepository.find({
            where: { project: { id: projectId }, isSelectedForClient: true },
        });
    }
    async findOne(id) {
        const feedback = await this.feedbackRepository.findOne({
            where: { id },
        });
        if (!feedback)
            throw new common_1.NotFoundException('Feedback not found');
        return feedback;
    }
    async update(id, dto) {
        const feedback = await this.findOne(id);
        Object.assign(feedback, dto);
        return this.feedbackRepository.save(feedback);
    }
    async delete(id) {
        const feedback = await this.findOne(id);
        await this.feedbackRepository.remove(feedback);
    }
    async toggleSelectFeedback(id, select) {
        const feedback = await this.feedbackRepository.findOne({
            where: { id },
        });
        if (!feedback)
            throw new common_1.NotFoundException('Feedback not found');
        feedback.isSelectedForClient = select;
        return this.feedbackRepository.save(feedback);
    }
};
FeedbackService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(feedback_entity_1.Feedback)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], FeedbackService);
exports.FeedbackService = FeedbackService;
//# sourceMappingURL=feedback.service.js.map