import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as fs from 'fs';
import { unlink } from 'fs/promises';
import pLimit from 'p-limit';
import { Cache } from 'cache-manager';
import { Express } from 'express';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectsCommand,
  ListObjectVersionsCommand,
  ListMultipartUploadsCommand,
  AbortMultipartUploadCommand,
  DeleteBucketCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) return String((error as any).message);
  return 'Unknown error occurred';
}

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class DatahubService {
  private readonly logger = new Logger(DatahubService.name);
  private s3: S3Client;
  CONCURRENCY_LIMIT = 10;

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    this.s3 = new S3Client({
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
      forcePathStyle: true,
    });
  }

  async uploadFile(folderPath: string, file: MulterFile) {
    const sanitizeFileName = (name: string) => name.replace(/[^a-zA-Z0-9.\-_]/g, '_');

    const safeFileName = `${Date.now()}_${sanitizeFileName(file.originalname)}`;
    const folder = `${folderPath}/${safeFileName}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME || '',
      Key: folder,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3.send(command);
      this.logger.log(`File uploaded successfully: ${folder}`);

      const downloadUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${folder}`;

      return {
        fileName: safeFileName,
        downloadUrl,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${getErrorMessage(error)}`);
      throw new Error('File upload failed');
    }
  }

  async generatePresignedUrl(userId: string, fileName: string) {
    const key = `${userId}/${fileName}`;
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      ContentType: 'image/jpeg',
    });

    try {
      return await getSignedUrl(this.s3, command, { expiresIn: 60 });
    } catch (error) {
      this.logger.error(`Error generating presigned URL: ${getErrorMessage(error)}`);
      throw new Error('Failed to generate presigned URL');
    }
  }

  async deleteFile(fileName: string) {
    this.logger.log(`Attempting to delete file with key: ${fileName}`);

    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME || '',
      Key: fileName,
    });

    try {
      await this.s3.send(command);
      this.logger.log(`File deleted successfully: ${fileName}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${getErrorMessage(error)}`);
      throw new Error('File deletion failed');
    }
  }

  async listAllObjectsInBucket(): Promise<string[]> {
    const allKeys: string[] = [];
    let continuationToken: string | undefined = undefined;

    try {
      do {
        const command = new ListObjectsV2Command({
          Bucket: process.env.S3_BUCKET_NAME || '',
          ContinuationToken: continuationToken,
        });
        const result = await this.s3.send(command);

        if (result.Contents) {
          result.Contents.forEach((object) => {
            if (object.Key) allKeys.push(object.Key);
          });
        }
        continuationToken = result.NextContinuationToken;
      } while (continuationToken);

      return allKeys;
    } catch (error) {
      this.logger.error(`Error listing objects in the bucket: ${getErrorMessage(error)}`);
      throw new Error('Failed to list objects');
    }
  }

  async deleteBucket(): Promise<void> {
    const bucketName = process.env.S3_BUCKET_NAME || '';
    try {
      // Delete object versions
      let isTruncated = true;
      let versionIdMarker: string | undefined = undefined;

      while (isTruncated) {
        const listVersionsCommand = new ListObjectVersionsCommand({
          Bucket: bucketName,
          VersionIdMarker: versionIdMarker,
        });

        const result = await this.s3.send(listVersionsCommand);

        if (result.Versions && result.Versions.length > 0) {
          const deleteParams = {
            Bucket: bucketName,
            Delete: {
              Objects: result.Versions.map((version) => ({
                Key: version.Key!,
                VersionId: version.VersionId!,
              })),
            },
          };
          const deleteCommand = new DeleteObjectsCommand(deleteParams);
          await this.s3.send(deleteCommand);
        }

        if (result.IsTruncated) {
          versionIdMarker = result.NextVersionIdMarker;
        } else {
          isTruncated = false;
        }
      }

      // Abort multipart uploads
      isTruncated = true;
      let keyMarker: string | undefined = undefined;

      while (isTruncated) {
        const listMultipartCommand = new ListMultipartUploadsCommand({
          Bucket: bucketName,
          KeyMarker: keyMarker,
        });

        const result = await this.s3.send(listMultipartCommand);

        if (result.Uploads) {
          for (const upload of result.Uploads) {
            const abortCommand = new AbortMultipartUploadCommand({
              Bucket: bucketName,
              Key: upload.Key!,
              UploadId: upload.UploadId!,
            });
            await this.s3.send(abortCommand);
          }
        }

        if (result.IsTruncated) {
          keyMarker = result.NextKeyMarker;
        } else {
          isTruncated = false;
        }
      }

      // Delete all objects
      isTruncated = true;
      let continuationToken: string | undefined = undefined;

      while (isTruncated) {
        const listObjectsCommand = new ListObjectsV2Command({
          Bucket: bucketName,
          ContinuationToken: continuationToken,
        });

        const result = await this.s3.send(listObjectsCommand);

        if (result.Contents && result.Contents.length > 0) {
          const deleteParams = {
            Bucket: bucketName,
            Delete: {
              Objects: result.Contents.map((object) => ({
                Key: object.Key!,
              })),
            },
          };
          const deleteCommand = new DeleteObjectsCommand(deleteParams);
          await this.s3.send(deleteCommand);
        }

        if (result.IsTruncated) {
          continuationToken = result.NextContinuationToken;
        } else {
          isTruncated = false;
        }
      }

      // Delete bucket
      const deleteBucketCommand = new DeleteBucketCommand({
        Bucket: bucketName,
      });

      await this.s3.send(deleteBucketCommand);
      this.logger.log(`Bucket ${bucketName} deleted successfully.`);
    } catch (error) {
      this.logger.error(`Failed to delete bucket ${bucketName}: ${getErrorMessage(error)}`);
      throw new Error('Bucket deletion failed');
    }
  }

  async generatePresignedUrlForUpload(fileName: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      ContentType: contentType,
    });

    try {
      return await getSignedUrl(this.s3, command, { expiresIn: 3600 });
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL: ${getErrorMessage(error)}`);
      throw new Error('Failed to generate presigned URL');
    }
  }

  async generateMultiplePresignedUrlsForUpload(
    files: { fileName: string; contentType: string }[],
  ): Promise<string[]> {
    const limit = pLimit(this.CONCURRENCY_LIMIT);

    const tasks = files.map(({ fileName, contentType }) =>
      limit(() => this.generatePresignedUrlForUpload(fileName, contentType)),
    );

    return Promise.all(tasks);
  }

  async generateGetPresignedUrl(fileName: string): Promise<string> {
    const cacheKey = `presigned-url:${fileName}`;

    const cachedUrl = await this.cacheManager.get<string>(cacheKey);
    if (cachedUrl) {
      this.logger.log(`Get presigned URL cache hit for ${fileName}`);
      return cachedUrl;
    }

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
    });

    try {
      const url = await getSignedUrl(this.s3, command, { expiresIn: 3600 });
      const modifiedUrl = url.replace(
        's3-np1.datahub.com.np/fotosfolio/',
        'cdn.fotosfolio.com/',
      );

      await this.cacheManager.set(cacheKey, modifiedUrl, 3600);

      return modifiedUrl;
    } catch (error) {
      throw new Error(`Failed to generate pre-signed URL: ${getErrorMessage(error)}`);
    }
  }
}
