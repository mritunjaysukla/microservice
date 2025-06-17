/// <reference types="node" />
import { LoggerService } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { ConfigService } from '@nestjs/config';
export declare class AppLoggerService implements LoggerService {
    private readonly asyncStorage;
    private readonly configService;
    private pino;
    constructor(asyncStorage: AsyncLocalStorage<Map<string, string>>, configService: ConfigService);
    error(message: any, trace?: string, context?: string): any;
    log(message: any, context?: string): any;
    warn(message: any, context?: string): any;
    private getMessage;
}
