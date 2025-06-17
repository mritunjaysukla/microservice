import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './entity/task.entity';
import { UpdateTaskDto } from './dto/update-task.dto';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(createTaskDto: CreateTaskDto, req: any): Promise<Task>;
    findAll(req: any, page?: number, limit?: number): Promise<{
        data: Task[];
        total: number;
    }>;
    findOne(id: string, req: any): Promise<Task>;
    update(id: string, updateTaskDto: UpdateTaskDto, req: any): Promise<Task>;
    remove(id: string, req: any): Promise<void>;
}
