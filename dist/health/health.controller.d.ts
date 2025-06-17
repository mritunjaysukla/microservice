import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { CacheHealthIndicator } from './indicators/cache/cache.health-indicator';
export declare class HealthController {
    private readonly health;
    private readonly db;
    private readonly cacheHealthIndicator;
    constructor(health: HealthCheckService, db: TypeOrmHealthIndicator, cacheHealthIndicator: CacheHealthIndicator);
    healthCheck(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
