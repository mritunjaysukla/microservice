import { Response } from 'express';
import { EnhancedZipService } from './enhanced-zip.service';
import { ZipRequestDto } from './dto/zip-request.dto';
export declare class ZipController {
    private readonly zipService;
    constructor(zipService: EnhancedZipService);
    createZip(zipRequest: ZipRequestDto, res: Response, req: any): Promise<void>;
}
