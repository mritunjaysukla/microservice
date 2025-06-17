import { User } from '../../user/entities/user.entity';
export declare enum TaskStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    CANCELED = "canceled"
}
export declare class Task {
    id: string;
    name: string;
    addedAt: Date;
    completedAt: Date;
    description: string;
    status: TaskStatus;
    user: User;
}
