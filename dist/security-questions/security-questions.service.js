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
exports.SecurityQuestionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcryptjs");
const security_questions_entity_1 = require("./entity/security-questions.entity");
const user_security_answer_entity_1 = require("./entity/user-security-answer.entity");
const auth_service_1 = require("src/user/services/auth/auth.service");
let SecurityQuestionsService = class SecurityQuestionsService {
    constructor(questionRepo, answerRepo, authService) {
        this.questionRepo = questionRepo;
        this.answerRepo = answerRepo;
        this.authService = authService;
    }
    async getAllQuestions() {
        return this.questionRepo.find();
    }
    async setUserAnswers(user, answers) {
        if (answers.length < 2 || answers.length > 3) {
            throw new common_1.BadRequestException('Must provide 2 or 3 answers.');
        }
        await this.answerRepo.delete({ user });
        const entries = await Promise.all(answers.map(async ({ questionId, answer }) => {
            const question = await this.questionRepo.findOneBy({ id: questionId });
            if (!question)
                throw new common_1.NotFoundException(`Question ID ${questionId} not found`);
            return this.answerRepo.create({
                user,
                question,
                answerHash: await bcrypt.hash(answer.trim(), 10),
            });
        }));
        await this.answerRepo.save(entries);
        await this.authService.enableSecurityOption(user.id, 'securityQuestion');
    }
    async verifyAnswer(email, questionId, providedAnswer) {
        const savedAnswer = await this.answerRepo.findOne({
            where: { user: { email }, question: { id: questionId } },
        });
        if (!savedAnswer) {
            return false;
        }
        const isMatch = await bcrypt.compare(providedAnswer, savedAnswer.answerHash);
        return isMatch;
    }
    async create(question) {
        const existing = await this.questionRepo.findOneBy({ question });
        if (existing) {
            throw new common_1.ConflictException('Security question already exists');
        }
        const newQuestion = this.questionRepo.create({ question });
        return this.questionRepo.save(newQuestion);
    }
    async getQuestionsSetByUser(userEmail) {
        const answers = await this.answerRepo.find({
            where: { user: { email: userEmail } },
            relations: ['question'],
        });
        return answers.map((answer) => ({
            questionId: answer.question.id,
            question: answer.question.question,
        }));
    }
};
SecurityQuestionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(security_questions_entity_1.SecurityQuestion)),
    __param(1, (0, typeorm_1.InjectRepository)(user_security_answer_entity_1.UserSecurityAnswer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository, typeof (_a = typeof auth_service_1.AuthService !== "undefined" && auth_service_1.AuthService) === "function" ? _a : Object])
], SecurityQuestionsService);
exports.SecurityQuestionsService = SecurityQuestionsService;
//# sourceMappingURL=security-questions.service.js.map