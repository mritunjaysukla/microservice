import {
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  S3Client,
} from '@aws-sdk/client-s3';
import Redis from 'ioredis';
import { ZipRequestDto } from './dto/zip-request.dto';
import * as archiver from 'archiver';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Response } from 'express';

@Injectable()
export class ZipService {
  private readonly logger = new Logger(ZipService.name);
  private s3Client: S3Client;
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });

    this.s3Client = new S3Client({
      region: process.env.S3_REGION || 'custom-region',
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY!,
        secretAccessKey: process.env.S3_SECRET_KEY!,
      },
    });
  }

  async archiveAndStreamZip(dto: ZipRequestDto, res: Response) {

    const { fileUrls, zipFileName } = dto;
    if (!fileUrls || fileUrls.length === 0) {
      throw new Error('No file URLs provided');
    }

    // Set response headers to prompt download
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName || 'archive.zip'}"`);

    const archive = archiver('zip');

    // Pipe archive stream directly to response
    archive.pipe(res);
    const unsupportedExtensions = ['.mov', '.mp4']; // extend as needed
    try {
      for (const fileUrl of fileUrls) {
        try {

          const decodedUrl = decodeURIComponent(fileUrl);

          // Fetch the file as a stream using axios
          const response = await axios.get(decodedUrl, { responseType: 'stream' });

          // Extract a filename from URL or generate one
          let fileName = decodedUrl.split('/').pop() || `file-${uuidv4()}`;
          if (fileName.toLowerCase().endsWith('.heic')) {
            fileName = fileName.replace(/\.heic$/i, '.jpg'); // fake extension change
          }

          if (fileName.toLowerCase().endsWith('.mov')) {
            fileName = fileName.replace(/\.mov$/i, '.jpg'); // fake extension change
          }
          // Append the stream to the archive with the file name inside zip
          archive.append(response.data, { name: fileName });

        } catch (err) {
          this.logger.error(`Error fetching or appending file ${fileUrl}: ${err.message}`);
          // Optionally, you can append a dummy file or skip on error
          continue;
        }
      }

      // Finalize the archive - this signals the end of the zip stream
      await archive.finalize();

      // The response ends when archive stream ends
    } catch (err) {
      this.logger.error('Error during zip archive creation', err);
      // If response already started, you can't send an error status easily
      if (!res.headersSent) {
        res.status(500).send('Error creating ZIP archive');
      }
    }
  }
}
