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
exports.SecurityQuestionsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const security_questions_service_1 = require("./security-questions.service");
const jwt_auth_guard_1 = require("src/user/guards/jwt-auth/jwt-auth.guard");
let SecurityQuestionsController = class SecurityQuestionsController {
    constructor(service) {
        this.service = service;
    }
    getAllQuestions() {
        return this.service.getAllQuestions();
    }
    async setAnswers(req, body) {
        await this.service.setUserAnswers(req.user, body.answers);
        return { message: 'Answers saved.' };
    }
    async create(question) {
        return await this.service.create(question);
    }
    async verifyAnswer(body) {
        const success = await this.service.verifyAnswer(body.email, body.questionId, body.answer);
        return { success };
    }
    async getUserQuestions(userEmail) {
        return await this.service.getQuestionsSetByUser(userEmail);
    }
};
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get all available security questions' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'List of security questions returned',
    }),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SecurityQuestionsController.prototype, "getAllQuestions", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Set user security question answers' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                answers: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            questionId: { type: 'number', example: 1 },
                            answer: { type: 'string', example: 'My first pet' },
                        },
                        required: ['questionId', 'answer'],
                    },
                },
            },
            required: ['answers'],
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Answers saved.' }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('set'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SecurityQuestionsController.prototype, "setAnswers", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new security question' }),
    (0, swagger_1.ApiBody)({
        description: 'The question to be added as a security question',
        type: String,
    }),
    (0, swagger_1.ApiResponse)({
        status: 409,
        description: 'The security question already exists.',
    }),
    __param(0, (0, common_1.Body)('question')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SecurityQuestionsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('verify'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify user answer to a security question' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                questionId: { type: 'number', example: 1 },
                answer: { type: 'string', example: 'My answer' },
                email: { type: 'string', example: 'sdfds@gmail.com' },
            },
            required: ['questionId', 'answer', 'email'],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Returns whether the answer is correct',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
            },
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SecurityQuestionsController.prototype, "verifyAnswer", null);
__decorate([
    (0, common_1.Get)('Questions-user'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SecurityQuestionsController.prototype, "getUserQuestions", null);
SecurityQuestionsController = __decorate([
    (0, swagger_1.ApiTags)('Security Questions'),
    (0, common_1.Controller)('security-questions'),
    __metadata("design:paramtypes", [security_questions_service_1.SecurityQuestionsService])
], SecurityQuestionsController);
exports.SecurityQuestionsController = SecurityQuestionsController;
//# sourceMappingURL=security-questions.controller.js.map