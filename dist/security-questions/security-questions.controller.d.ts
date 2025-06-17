import { SecurityQuestionsService } from './security-questions.service';
export declare class SecurityQuestionsController {
    private readonly service;
    constructor(service: SecurityQuestionsService);
    getAllQuestions(): Promise<import("./entity/security-questions.entity").SecurityQuestion[]>;
    setAnswers(req: any, body: {
        answers: {
            questionId: number;
            answer: string;
        }[];
    }): Promise<{
        message: string;
    }>;
    create(question: string): Promise<import("./entity/security-questions.entity").SecurityQuestion>;
    verifyAnswer(body: {
        questionId: number;
        answer: string;
        email: string;
    }): Promise<{
        success: boolean;
    }>;
    getUserQuestions(userEmail: string): Promise<{
        questionId: number;
        question: string;
    }[]>;
}
