import { OnModuleDestroy } from '@nestjs/common';
import { Cache } from 'cache-manager';
export declare class AppCacheModule implements OnModuleDestroy {
    private cacheManager;
    private readonly logger;
    constructor(cacheManager: Cache);
    onModuleDestroy(): any;
}
