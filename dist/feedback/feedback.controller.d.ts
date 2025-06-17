import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/createFeedback.dto';
import { UpdateFeedbackDto } from './dto/updateFeedback.dto';
export declare class FeedbackController {
    private readonly feedbackService;
    constructor(feedbackService: FeedbackService);
    create(dto: CreateFeedbackDto): Promise<import("./entity/feedback.entity").Feedback>;
    findAll(projectId: string): Promise<import("./entity/feedback.entity").Feedback[]>;
    findOne(id: string): Promise<import("./entity/feedback.entity").Feedback>;
    update(id: string, dto: UpdateFeedbackDto): Promise<import("./entity/feedback.entity").Feedback>;
    delete(id: string): Promise<void>;
    toggleSelectFeedback(id: string, select: boolean): Promise<import("./entity/feedback.entity").Feedback>;
}
