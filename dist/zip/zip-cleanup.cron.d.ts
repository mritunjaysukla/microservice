export declare class ZipCleanupCron {
    private readonly logger;
    private redis;
    constructor();
    handleCleanup(): Promise<void>;
}
