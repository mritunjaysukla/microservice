import { Repository } from 'typeorm';
import { Feedback } from './entity/feedback.entity';
import { User } from 'src/user/entities/user.entity';
import { Project } from 'src/project/entities/project.entity';
import { CreateFeedbackDto } from './dto/createFeedback.dto';
import { UpdateFeedbackDto } from './dto/updateFeedback.dto';
export declare class FeedbackService {
    private feedbackRepository;
    private userRepository;
    private projectRepository;
    constructor(feedbackRepository: Repository<Feedback>, userRepository: Repository<User>, projectRepository: Repository<Project>);
    create(dto: CreateFeedbackDto): Promise<Feedback>;
    findAll(projectId: string): Promise<Feedback[]>;
    findOne(id: string): Promise<Feedback>;
    update(id: string, dto: UpdateFeedbackDto): Promise<Feedback>;
    delete(id: string): Promise<void>;
    toggleSelectFeedback(id: string, select: boolean): Promise<Feedback>;
}
