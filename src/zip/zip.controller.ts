import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ZipService } from './zip.service';
import { ZipRequest, ZipJob } from './interfaces/zip.interface';

@ApiTags('zip')
@Controller('zip')
export class ZipController {
  constructor(private readonly zipService: ZipService) { }

  @Post('create')
  @ApiOperation({ summary: 'Create a zip from folder files' })
  @ApiResponse({ status: 201, description: 'Job started with jobId.' })
  async createZip(@Body() data: ZipRequest): Promise<{ jobId: string }> {
    const jobId = await this.zipService.processZipRequest(data);
    return { jobId };
  }

  @Get('status/:jobId')
  @ApiOperation({ summary: 'Get zip creation job status' })
  @ApiResponse({ status: 200, description: 'Job status details.' })
  async getStatus(@Param('jobId') jobId: string): Promise<ZipJob | { message: string }> {
    const status = await this.zipService.getJobStatus(jobId);
    if (!status) {
      throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
    }
    return status;
  }
}
