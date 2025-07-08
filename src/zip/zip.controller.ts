// src/zip/zip.controller.ts

import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { EnhancedZipService } from './enhanced-zip.service';
import { ZipRequestDto } from './dto/zip-request.dto';

// Ensure proper error handling
function ensureError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return new Error(error.message);
  }
  if (typeof error === 'string') return new Error(error);
  return new Error(`Unknown error: ${JSON.stringify(error)}`);
}

@Controller('zip')
export class ZipController {
  private readonly logger = new Logger(ZipController.name);

  constructor(private readonly zipService: EnhancedZipService) { }

  @Post()
  async createZip(
    @Body() zipRequest: ZipRequestDto,
    @Res() res: Response,
  ) {
    try {
      // Remove authentication - use default user ID for now
      const userId = 'default-user';

      await this.zipService.archiveAndStreamZip(zipRequest, res, userId);
    } catch (error) {
      const safeError = ensureError(error);
      this.logger.error(`Controller error: ${safeError.message}`, safeError.stack);

      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          error: 'Unhandled controller error',
          message: safeError.message,
        });
      }
    }
  }


}
