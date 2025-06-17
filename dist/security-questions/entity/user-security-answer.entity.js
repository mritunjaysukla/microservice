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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSecurityAnswer = void 0;
const user_entity_1 = require("../../user/entities/user.entity");
const typeorm_1 = require("typeorm");
const security_questions_entity_1 = require("./security-questions.entity");
let UserSecurityAnswer = class UserSecurityAnswer {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], UserSecurityAnswer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: false, onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], UserSecurityAnswer.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => security_questions_entity_1.SecurityQuestion, { eager: true, onDelete: 'CASCADE' }),
    __metadata("design:type", security_questions_entity_1.SecurityQuestion)
], UserSecurityAnswer.prototype, "question", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UserSecurityAnswer.prototype, "answerHash", void 0);
UserSecurityAnswer = __decorate([
    (0, typeorm_1.Entity)('user_security_answers'),
    (0, typeorm_1.Unique)(['user', 'question'])
], UserSecurityAnswer);
exports.UserSecurityAnswer = UserSecurityAnswer;
//# sourceMappingURL=user-security-answer.entity.js.map