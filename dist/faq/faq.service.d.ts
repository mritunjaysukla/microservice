import { Repository } from 'typeorm';
import { Faq } from './entity/faq.entity';
export declare class FaqService {
    private readonly faqRepository;
    constructor(faqRepository: Repository<Faq>);
    create(data: Partial<Faq>): Promise<Faq>;
    findAll(): Promise<Faq[]>;
    findOne(id: string): Promise<Faq>;
    update(id: string, data: Partial<Faq>): Promise<Faq>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
