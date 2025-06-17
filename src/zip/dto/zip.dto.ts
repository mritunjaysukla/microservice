import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ZipFile {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  downloadUrl: string;
}

export class ZipJobDto {
  @IsString()
  @IsNotEmpty()
  jobId: string;

  @IsString()
  @IsNotEmpty()
  folderId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ZipFile)
  files: ZipFile[];

  @IsString()
  @IsNotEmpty()
  userId: string;
}
