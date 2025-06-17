import { FaqService } from './faq.service';
import { Faq } from './entity/faq.entity';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
export declare class FaqController {
    private readonly faqService;
    constructor(faqService: FaqService);
    create(createFaqDto: CreateFaqDto): Promise<Faq>;
    findAll(): Promise<Faq[]>;
    findOne(id: string): Promise<Faq>;
    update(id: string, updateFaqDto: UpdateFaqDto): Promise<Faq>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
