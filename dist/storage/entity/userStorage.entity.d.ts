import { Plan } from '../../plan/entity/plan.entity';
import { User } from '../../user/entities/user.entity';
export declare class UserStorage {
    id: number;
    user: User;
    plan: Plan;
    storageLimit: string;
    storageUsed: string;
    reservedStorage: string;
}
