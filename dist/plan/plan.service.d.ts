import { Repository } from 'typeorm';
import { Plan } from './entity/plan.entity';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
export declare class PlanService {
    private readonly planRepository;
    constructor(planRepository: Repository<Plan>);
    create(createPlanDto: CreatePlanDto): Promise<Plan>;
    findAll(): Promise<Plan[]>;
    findOne(id: string): Promise<Plan>;
    update(id: string, updatePlanDto: UpdatePlanDto): Promise<Plan>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
