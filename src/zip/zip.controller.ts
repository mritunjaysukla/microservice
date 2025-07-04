import { Controller, Post, Body, Res } from '@nestjs/common';
import { ZipService } from './zip.service';
import { ZipRequestDto } from './dto/zip-request.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Zip')
@Controller('zip')
export class ZipController {
  constructor(private readonly zipService: ZipService) { }

  @Post()
  @ApiOperation({ summary: 'Create and download zip from file URLs' })
  @ApiBody({ type: ZipRequestDto })
  @ApiResponse({ status: 200, description: 'Zip file streamed successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Server Error' })
  async createZip(@Body() dto: ZipRequestDto, @Res() res: Response) {
    return this.zipService.archiveAndStreamZip(dto, res);
  }
}