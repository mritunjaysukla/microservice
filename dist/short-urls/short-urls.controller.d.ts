import { Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { ShortUrlService } from './short-urls.service';
export declare class ShortUrlController {
    private readonly shortUrlService;
    private readonly httpService;
    constructor(shortUrlService: ShortUrlService, httpService: HttpService);
    createShortUrl(createShortUrlDto: CreateShortUrlDto): Promise<{
        message: string;
        slug: string;
        shortUrl: string;
    }>;
    serveProxiedContent(slug: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
