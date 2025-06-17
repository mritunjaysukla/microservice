import { ConfigService } from '@nestjs/config';
import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/cache-manager';
export declare class CacheConfigService implements CacheOptionsFactory {
    private readonly configService;
    constructor(configService: ConfigService);
    createCacheOptions(): CacheModuleOptions;
}
