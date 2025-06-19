import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import { unlink } from 'fs/promises';
import pLimit from 'p-limit';
import { Cache } from 'cache-manager';
import { Express } from 'express';

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
  private s3: AWS.S3;

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    const s3Config = {
      accessKeyId: process.env.S3_ACCESS_KEY,
      secretAccessKey: process.env.S3_SECRET_KEY,
      region: process.env.S3_REGION,
      endpoint: process.env.S3_ENDPOINT,
      s3ForcePathStyle: true, // Required for non-AWS S3 compatible services
      signatureVersion: 'v4',
    };

    this.s3 = new AWS.S3(s3Config);
  }

  // Upload file to S3
  async uploadFile(folderPath: string, file: MulterFile) {
    const sanitizeFileName = (name: string) => {
      return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    };

    const safeFileName = `${Date.now()}_${sanitizeFileName(file.originalname)}`;
    const folder = `${folderPath}/${safeFileName}`;

    // if (!file.path) {
    //   throw new HttpException('File path is missing', HttpStatus.BAD_REQUEST);
    // }

    // // ✅ Create a readable stream from the file saved to disk
    // const fileStream = fs.createReadStream(file.path);
    // console.log('File stream created', fileStream);

    const params: AWS.S3.PutObjectRequest = {
      Bucket: process.env.S3_BUCKET_NAME || '',
      Key: folder,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: 'public-read',
    };

    try {
      const uploadResult = await this.s3
        .upload(params, {
          partSize: 10 * 1024 * 1024, // 10 MB chunk size
          queueSize: 4, // Parallel uploads
        })
        .promise();
      console.log(uploadResult);
      this.logger.log(`File uploaded successfully: ${uploadResult.Location}`);

      // await unlink(file.path);

      // const encodedKey = encodeURIComponent(folder).replace(/%2F/g, '/');
      const downloadUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${folder}`;

      return {
        fileName: safeFileName,
        downloadUrl: downloadUrl,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to upload file to S3: ${error.message}`);
      throw new Error('File upload failed');
    }
  }

  // Generate presigned URL for direct upload to S3
  async generatePresignedUrl(userId: string, fileName: string) {
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${userId}/${fileName}`,
      Expires: 60, // URL validity time in seconds
      ContentType: 'image/jpeg', // Change content type based on your needs
      // ACL: 'public-read',
    };

    try {
      const url = await this.s3.getSignedUrlPromise('putObject', s3Params);
      return url;
    } catch (error) {
      this.logger.error(`Error generating presigned URL: ${error.message}`);
      throw new Error('Failed to generate presigned URL');
    }
  }

  async deleteFile(fileName: string) {
    this.logger.log(`Attempting to delete file with key: ${fileName}`);

    const params = {
      Bucket: process.env.S3_BUCKET_NAME || '',
      Key: fileName,
    };

    try {
      await this.s3.deleteObject(params).promise();
      this.logger.log(`File deleted successfully: ${fileName}`);
    } catch (error) {
      this.logger.error(`Failed to delete file from S3: ${error.message}`);
      throw new Error('File deletion failed');
    }
  }

  // Add this method inside your DatahubService class

  async listAllObjectsInBucket(): Promise<string[]> {
    const allKeys: string[] = [];

    try {
      const params: AWS.S3.ListObjectsV2Request = {
        Bucket: process.env.S3_BUCKET_NAME || '',
      };

      const result = await this.s3.listObjectsV2(params).promise();

      if (result.Contents) {
        result.Contents.forEach((object) => {
          allKeys.push(object.Key!); // Collecting the object keys (filenames)
        });
      }
      // const delete_ = await Promise.all(
      //   allKeys.map((key) => {
      //     return this.deleteFile(key); // Ensure this returns the promise from deleteFile
      //   }),
      // );

      // const params_ = {
      //   Bucket: process.env.S3_BUCKET_NAME || '',
      // };

      // await this.s3.deleteBucket(params_).promise(); // Delete the bucket
      // this.logger.log(
      //   `Bucket ${process.env.S3_BUCKET_NAME} deleted successfully.`,
      // );

      return allKeys; // Return the list of object keys (filenames)
    } catch (error) {
      this.logger.error(
        `Error listing objects in the bucket: ${error.message}`,
      );
      throw new Error('Failed to list objects');
    }
  }

  async deleteBucket(): Promise<void> {
    const bucketName = process.env.S3_BUCKET_NAME || '';
    try {
      // Step 1: Delete all object versions if versioning is enabled
      let isTruncated = true;
      let versionIdMarker: string | undefined = undefined;

      while (isTruncated) {
        const listParams: AWS.S3.ListObjectVersionsRequest = {
          Bucket: bucketName,
          VersionIdMarker: versionIdMarker,
        };

        const result = await this.s3.listObjectVersions(listParams).promise();

        if (result.Versions) {
          const deleteParams = {
            Bucket: bucketName,
            Delete: {
              Objects: result.Versions.map((version) => ({
                Key: version.Key!,
                VersionId: version.VersionId!,
              })),
            },
          };

          await this.s3.deleteObjects(deleteParams).promise();
        }

        if (result.IsTruncated) {
          versionIdMarker = result.NextVersionIdMarker;
        } else {
          isTruncated = false;
        }
      }

      // Step 2: Abort all multipart uploads if any
      isTruncated = true;
      let keyMarker: string | undefined = undefined;

      while (isTruncated) {
        const listParams: AWS.S3.ListMultipartUploadsRequest = {
          Bucket: bucketName,
          KeyMarker: keyMarker,
        };

        const result = await this.s3.listMultipartUploads(listParams).promise();

        if (result.Uploads) {
          for (const upload of result.Uploads) {
            const abortParams = {
              Bucket: bucketName,
              Key: upload.Key!,
              UploadId: upload.UploadId!,
            };

            await this.s3.abortMultipartUpload(abortParams).promise();
          }
        }

        if (result.IsTruncated) {
          keyMarker = result.NextKeyMarker;
        } else {
          isTruncated = false;
        }
      }

      // Step 3: Delete all objects in the bucket
      isTruncated = true;
      let marker: string | undefined = undefined;

      while (isTruncated) {
        const listParams: AWS.S3.ListObjectsV2Request = {
          Bucket: bucketName,
          ContinuationToken: marker,
        };

        const result = await this.s3.listObjectsV2(listParams).promise();

        if (result.Contents) {
          const deleteParams = {
            Bucket: bucketName,
            Delete: {
              Objects: result.Contents.map((object) => ({
                Key: object.Key!,
              })),
            },
          };

          await this.s3.deleteObjects(deleteParams).promise();
        }

        if (result.IsTruncated) {
          marker = result.NextContinuationToken;
        } else {
          isTruncated = false;
        }
      }

      // Step 4: Delete the bucket
      const params = {
        Bucket: bucketName,
      };

      await this.s3.deleteBucket(params).promise();
      this.logger.log(`Bucket ${bucketName} deleted successfully.`);
    } catch (error) {
      this.logger.error(
        `Failed to delete bucket ${bucketName}: ${error.message}`,
      );
      throw new Error('Bucket deletion failed');
    }
  }
  // async generatePresignedUrlForUpload(
  //   fileName: string,
  //   contentType: string,
  // ): Promise<string> {
  //   const params = {
  //     Bucket: process.env.S3_BUCKET_NAME,
  //     Key: fileName,
  //     Expires: 3600, // 1 hour
  //     ContentType: contentType,
  //     ACL: 'public-read',
  //   };

  //   const url = await this.s3.getSignedUrlPromise('putObject', params);
  //   console.log(url);

  //   return url;
  // }

  // async generateMultiplePresignedUrlsForUpload(
  //   files: { fileName: string; contentType: string }[],
  // ): Promise<string[]> {
  //   return Promise.all(
  //     files.map((file) =>
  //       this.generatePresignedUrlForUpload(file.fileName, file.contentType),
  //     ),
  //   );
  // }

  CONCURRENCY_LIMIT = 10;

  async generatePresignedUrlForUpload(
    fileName: string,
    contentType: string,
  ): Promise<string> {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Expires: 3600,
      ContentType: contentType,
      // ACL: 'public-read',
    };

    return this.s3.getSignedUrlPromise('putObject', params);
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
  // async generatePresignedUrlsForParts(
  //     fileName: string,
  //     uploadId: string,
  //     partCount: number,
  //   ): Promise<{ partNumber: number; url: string }[]> {
  //     const urls = [];

  //     for (let partNumber = 1; partNumber <= partCount; partNumber++) {
  //       const command = new UploadPartCommand({
  //         Bucket: process.env.S3_BUCKET_NAME,
  //         Key: fileName,
  //         UploadId: uploadId,
  //         PartNumber: partNumber,
  //       });

  //       const signedUrl = await getSignedUrl(this.s3, command, { expiresIn: 3600 }); // 1 hour

  //       urls.push({ partNumber, url: signedUrl });
  //     }

  //     return urls;
  //   }
  //
  // Method to generate a pre-signed URL
  async generateGetPresignedUrl(fileName: string): Promise<string> {
    const cacheKey = `presigned-url:${fileName}`;

    // 1. Try to get from cache
    const cachedUrl = await this.cacheManager.get<string>(cacheKey);
    if (cachedUrl) {
      console.log('from cache');
      return cachedUrl;
    }

    // 2. Generate if not in cache
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Expires: 3600,
    };

    try {
      const url = await this.s3.getSignedUrlPromise('getObject', params);
      const modifiedUrl = url.replace(
        's3-np1.datahub.com.np/fotosfolio/',
        'cdn.fotosfolio.com/',
      );

      // 3. Store in Redis cache
      await this.cacheManager.set(cacheKey, modifiedUrl, 3600); // Set TTL = 55s

      return modifiedUrl;
    } catch (error) {
      throw new Error(`Failed to generate pre-signed URL: ${error.message}`);
    }
  }
}
