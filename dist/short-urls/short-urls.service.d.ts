import { Repository } from 'typeorm';
import { ShortUrl } from './entity/short-url.entity';
export declare class ShortUrlService {
    private readonly shortUrlRepository;
    constructor(shortUrlRepository: Repository<ShortUrl>);
    createShortUrl(originalUrl: string): Promise<string>;
    getOriginalUrl(slug: string): Promise<string>;
}
