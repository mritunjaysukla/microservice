export declare class ZipCleanupCron {
    private readonly logger;
    private readonly s3;
    private readonly redis;
    constructor();
    handleCleanup(): Promise<void>;
}
