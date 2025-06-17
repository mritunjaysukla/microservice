import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { Plan } from './entity/plan.entity';
export declare class PlanController {
    private readonly planService;
    constructor(planService: PlanService);
    create(createPlanDto: CreatePlanDto): Promise<Plan>;
    findAll(): Promise<Plan[]>;
    findOne(id: string): Promise<Plan>;
    update(id: string, updatePlanDto: UpdatePlanDto): Promise<Plan>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
