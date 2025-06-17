import { TaskStatus } from '../entity/task.entity';
export declare class CreateTaskDto {
    name: string;
    description: string;
    status: TaskStatus;
}
