import { User } from '../../user/entities/user.entity';
import { SecurityQuestion } from './security-questions.entity';
export declare class UserSecurityAnswer {
    id: number;
    user: User;
    question: SecurityQuestion;
    answerHash: string;
}
