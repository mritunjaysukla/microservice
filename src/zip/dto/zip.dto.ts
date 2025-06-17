import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateZipDto {
  @IsString()
  @IsNotEmpty()
  folderId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsOptional()
  zipName?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  fileIds?: string[];
}

export class ZipStatusDto {
  @IsString()
  @IsNotEmpty()
  jobId: string;
}

export class ZipResponseDto {
  jobId: string;
  status: string;
  progress: number;
  totalFiles: number;
  processedFiles: number;
  url?: string;
  error?: string;
}