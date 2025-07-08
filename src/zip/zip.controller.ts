// src/zip/zip.controller.ts

import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { EnhancedZipService } from './enhanced-zip.service';
import { ZipRequestDto } from './dto/zip-request.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('zip')
export class ZipController {
  constructor(private readonly zipService: EnhancedZipService) { }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async createZip(
    @Body() zipRequest: ZipRequestDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    try {
      if (!req.user?.id) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json({ error: 'Unauthorized' });
      }

      await this.zipService.archiveAndStreamZip(zipRequest, res, req.user.id);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Unhandled controller error',
        message: error?.message || error,
      });
    }
  }
}
