import { Controller, Post, Body, Res } from '@nestjs/common';
import { ZipService } from './zip.service';
import { ZipRequestDto } from './dto/zip-request.dto';
import { Response } from 'express';

@Controller('zip')
export class ZipController {
  constructor(private readonly zipService: ZipService) { }

  @Post()
  async createZip(@Body() dto: ZipRequestDto, @Res() res: Response) {
    return this.zipService.archiveAndStreamZip(dto, res);
  }
}
