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
import { ZipJob, ZipStatusResponse } from './interfaces/zip.interface';
import { CreateZipDto, ZipResponseDto } from './dto/zip.dto';

@ApiTags('zip')
@Controller('zip')
export class ZipController {
  constructor(private readonly zipService: ZipService) { }

  @Post('create')
  @ApiOperation({ summary: 'Create a zip from folder files' })
  @ApiResponse({
    status: 201,
    description: 'Job started successfully',
    type: String
  })
  async createZip(@Body() createZipDto: CreateZipDto): Promise<{ jobId: string }> {
    const jobId = await this.zipService.processZipRequest(createZipDto);
    return { jobId };
  }

  @Get('status/:jobId')
  @ApiOperation({ summary: 'Get zip creation job status' })
  @ApiResponse({
    status: 200,
    description: 'Job status details',
    type: ZipResponseDto  // Changed from ZipStatusResponse to ZipResponseDto
  })
  async getStatus(@Param('jobId') jobId: string): Promise<ZipJob> {
    const status = await this.zipService.getJobStatus(jobId);
    if (!status) {
      throw new HttpException('Job not found', HttpStatus.NOT_FOUND);
    }
    return status;
  }
}
