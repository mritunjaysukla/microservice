/// <reference types="node" />
import { NestMiddleware } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
export declare class AsyncStorageMiddleware implements NestMiddleware {
    private readonly asyncStorage;
    constructor(asyncStorage: AsyncLocalStorage<Map<string, string>>);
    use(req: any, res: any, next: () => void): void;
}
