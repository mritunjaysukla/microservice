import { StorageService } from './storage.service';
import { StorageDto } from './dto/Storage.dto';
export declare class StorageController {
    private readonly storageService;
    constructor(storageService: StorageService);
    getReservedStorage(userId: string): Promise<string>;
    getStorage(userId: string): Promise<{
        storageUsed: number;
        storageLimit: number;
        storageRemaining: number;
        reserverdStorage: number;
    }>;
    createOrUpdateStorage(StorageDto: StorageDto): Promise<import("./entity/userStorage.entity").UserStorage>;
    getTotalStorage(): Promise<number>;
    validateStorageAndReserveStorage(userId: string, totalFileSize: string): Promise<{
        status: string;
    }>;
    addStorageLimit(userId: string, additionalStorage: string): Promise<{
        message: string;
        data: import("./entity/userStorage.entity").UserStorage;
    }>;
}
