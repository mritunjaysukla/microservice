import {
  Controller,
  Post,
  Body,
  Res,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { EnhancedZipService } from './enhanced-zip.service';
import { ZipRequestDto } from './dto/zip-request.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('zip')
export class ZipController {
  constructor(private readonly zipService: EnhancedZipService) { }

  @Post()
  async createZip(
    @Body() zipRequest: ZipRequestDto,
    @Res() res: Response,
    @Request() req,
  ) {
    return this.zipService.archiveAndStreamZip(zipRequest, res, req.user.id);
  }
}
