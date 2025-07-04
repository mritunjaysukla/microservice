import { ZipService } from './zip.service';
import { ZipRequestDto } from './dto/zip-request.dto';
import { Response } from 'express';
export declare class ZipController {
    private readonly zipService;
    constructor(zipService: ZipService);
    createZip(dto: ZipRequestDto, res: Response): Promise<void>;
}
