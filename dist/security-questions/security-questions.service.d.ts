import { Repository } from 'typeorm';
import { SecurityQuestion } from './entity/security-questions.entity';
import { UserSecurityAnswer } from './entity/user-security-answer.entity';
import { User } from 'src/user/entities/user.entity';
import { AuthService } from 'src/user/services/auth/auth.service';
export declare class SecurityQuestionsService {
    private questionRepo;
    private answerRepo;
    private readonly authService;
    constructor(questionRepo: Repository<SecurityQuestion>, answerRepo: Repository<UserSecurityAnswer>, authService: AuthService);
    getAllQuestions(): Promise<SecurityQuestion[]>;
    setUserAnswers(user: User, answers: {
        questionId: number;
        answer: string;
    }[]): Promise<void>;
    verifyAnswer(email: string, questionId: number, providedAnswer: string): Promise<boolean>;
    create(question: string): Promise<SecurityQuestion>;
    getQuestionsSetByUser(userEmail: string): Promise<{
        questionId: number;
        question: string;
    }[]>;
}
