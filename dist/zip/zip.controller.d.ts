import { Response, Request } from 'express';
import { EnhancedZipService } from './enhanced-zip.service';
import { ZipRequestDto } from './dto/zip-request.dto';
export declare class ZipController {
    private readonly zipService;
    constructor(zipService: EnhancedZipService);
    createZip(zipRequest: ZipRequestDto, res: Response, req: Request): Promise<Response<any, Record<string, any>>>;
}
