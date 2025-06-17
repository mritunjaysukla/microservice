import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import B2 from 'backblaze-b2';
import { Repository } from 'typeorm';
import { Upload } from './entity/upload.entity';
export declare class BackblazeService {
    private configService;
    private uploadRepository;
    readonly logger: Logger;
    readonly MAX_RETRIES = 3;
    readonly RETRY_DELAY = 1000;
    b2: B2;
    uploadUrl: string | null;
    uploadAuthToken: string | null;
    bucketId: string;
    authToken: string;
    apiUrl: string;
    tokenExpirationTime: number;
    constructor(configService: ConfigService, uploadRepository: Repository<Upload>);
    delay(ms: number): Promise<void>;
    refreshCredentials(): Promise<void>;
    getUploadUrlWithRetry(): Promise<void>;
    isTokenExpired(): boolean;
    getDownloadUrl(fileName: string): Promise<string>;
    getDownloadUrls(fileNames: string[]): Promise<string[]>;
}
