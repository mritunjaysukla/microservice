import { Repository } from 'typeorm';
import { Task } from './entity/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from 'src/user/entities/user.entity';
export declare class TasksService {
    private tasksRepository;
    constructor(tasksRepository: Repository<Task>);
    create(createTaskDto: CreateTaskDto, user: User): Promise<Task>;
    findAll(user: User, page?: number, limit?: number): Promise<{
        data: Task[];
        total: number;
        pageNumber: number;
    }>;
    findOne(id: string, user: User): Promise<Task>;
    update(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<Task>;
    remove(id: string, user: User): Promise<void>;
}
