import { Repository } from 'typeorm';
import { UserStorage } from './entity/userStorage.entity';
import { UserService } from 'src/user/services/user/user.service';
import { PlanService } from 'src/plan/plan.service';
import { User } from 'src/user/entities/user.entity';
export declare class StorageService {
    private readonly userStorageRepository;
    private readonly userService;
    private readonly planService;
    private readonly userRepository;
    constructor(userStorageRepository: Repository<UserStorage>, userService: UserService, planService: PlanService, userRepository: Repository<User>);
    saveStorageUsed(userId: string, storageUsed: string): Promise<UserStorage>;
    getCurrentStorageUsed(userId: string): Promise<{
        storageUsed: number;
        storageLimit: number;
        storageRemaining: number;
        reserverdStorage: number;
    }>;
    getTotalStorageUsed(): Promise<number>;
    validateStorageAndReserveStorage(userId: string, totalFileSize: string): Promise<{
        status: string;
    }>;
    getReserverdStorage(userId: string): Promise<string>;
    addStorageLimit(userId: string, additionalStorage: string): Promise<UserStorage>;
}
