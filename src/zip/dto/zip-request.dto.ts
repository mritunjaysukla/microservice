// src/zip/dto/zip-request.dto.ts

import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class ZipRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  fileUrls: string[];

  @IsString()
  zipFileName: string;
}
