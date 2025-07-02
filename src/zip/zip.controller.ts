import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ZipService } from './zip.service';
import { ZipRequestDto } from './dto/zip-request.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Zip')
@Controller('zip')
export class ZipController {
  constructor(private readonly zipService: ZipService) { }

  // Optional: Keep this for synchronous streaming (small jobs)
  @Post()
  @ApiOperation({ summary: 'Create a zip from S3 folder contents (sync)' })
  @ApiBody({ type: ZipRequestDto })
  @ApiResponse({ status: 201, description: 'Zip created and streamed successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Server Error' })
  async createZip(@Body() dto: ZipRequestDto, @Res() res: Response) {
    return this.zipService.archiveAndStreamZip(dto, res);
  }

  // NEW: Create job for async zip (returns jobId immediately)
  @Post('job')
  @ApiOperation({ summary: 'Create zip job for async processing' })
  @ApiBody({ type: ZipRequestDto })
  @ApiResponse({ status: 202, description: 'Zip job created' })
  async createZipJob(@Body() dto: ZipRequestDto) {
    const jobId = await this.zipService.createZipJob(dto);
    return { jobId };
  }

  // NEW: Poll job status
  @Get('job/status/:jobId')
  @ApiOperation({ summary: 'Get status of zip job' })
  async getStatus(@Param('jobId') jobId: string) {
    const status = await this.zipService.getJobStatus(jobId);
    if (status.status === 'not_found') {
      throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
    }
    return status;
  }

  // NEW: Download completed zip
  @Get('job/download/:jobId')
  @ApiOperation({ summary: 'Download zip file for completed job' })
  async downloadZip(@Param('jobId') jobId: string, @Res() res: Response) {
    await this.zipService.downloadZip(jobId, res);
  }
}
