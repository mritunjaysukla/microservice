import archiver from 'archiver';
import * as fs from 'fs';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import pLimit from 'p-limit';

interface ZipTaskParams {
  files: {
    key: string;
    size: number;
    originalName?: string;
  }[];
  s3Config: {
    region: string;
    endpoint: string;
    accessKey: string;
    secretKey: string;
    bucket: string;
  };
  zipFileName?: string;
  jobId: string;
  chunkIndex?: number;
  totalChunks?: number;
  maxConcurrentDownloads: number;
}

interface ZipResult {
  filePath: string;
  fileSize: number;
  successCount: number;
  totalCount: number;
  chunkIndex?: number;
}

async function enhancedZipTask(params: ZipTaskParams): Promise<ZipResult> {
  const {
    files,
    s3Config,
    zipFileName,
    jobId,
    chunkIndex,
    totalChunks,
    maxConcurrentDownloads,
  } = params;

  const s3Client = new S3Client({
    region: s3Config.region,
    endpoint: s3Config.endpoint,
    credentials: {
      accessKeyId: s3Config.accessKey,
      secretAccessKey: s3Config.secretKey,
    },
    forcePathStyle: true,
  });

  const startTime = Date.now();
  console.log(`[${jobId}] Starting zip processing for ${files.length} files${chunkIndex !== undefined ? ` (chunk ${chunkIndex + 1}/${totalChunks})` : ''}`);

  return new Promise(async (resolve, reject) => {
    const fileName = zipFileName || `archive-${uuidv4()}.zip`;
    const tempDir = path.resolve(__dirname, '../../../tmp');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempPath = path.join(tempDir, chunkIndex !== undefined ? `${chunkIndex}-${fileName}` : fileName);
    const output = createWriteStream(tempPath);
    let isCompleted = false;
    let successCount = 0;

    const archive = archiver('zip', {
      zlib: { level: 0 }, // Fastest compression
      forceLocalTime: true,
    });

    const cleanup = () => {
      if (fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch (error) {
          console.warn(`[${jobId}] Cleanup failed:`, error);
        }
      }
    };

    output.on('close', () => {
      if (!isCompleted) {
        isCompleted = true;
        try {
          const stats = fs.statSync(tempPath);
          const processingTime = Date.now() - startTime;

          console.log(`[${jobId}] Zip created: ${tempPath} (${formatFileSize(stats.size)}) in ${(processingTime / 1000).toFixed(1)}s`);
          console.log(`[${jobId}] Files: ${successCount}/${files.length} successful`);

          resolve({
            filePath: tempPath,
            fileSize: stats.size,
            successCount,
            totalCount: files.length,
            chunkIndex,
          });
        } catch (error) {
          cleanup();
          reject(error);
        }
      }
    });

    output.on('error', (err) => {
      console.error(`[${jobId}] Output error:`, err);
      cleanup();
      if (!isCompleted) {
        isCompleted = true;
        reject(err);
      }
    });

    archive.on('error', (err) => {
      console.error(`[${jobId}] Archive error:`, err);
      cleanup();
      if (!isCompleted) {
        isCompleted = true;
        reject(err);
      }
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn(`[${jobId}] Warning:`, err);
      } else {
        console.error(`[${jobId}] Archive critical warning:`, err);
        cleanup();
        if (!isCompleted) {
          isCompleted = true;
          reject(err);
        }
      }
    });

    archive.pipe(output);

    try {
      const limit = pLimit(maxConcurrentDownloads);
      const processFile = async (file: typeof files[0], index: number) => {
        const retries = 2;
        let attempt = 0;

        while (attempt < retries) {
          try {
            const s3Obj = await s3Client.send(
              new GetObjectCommand({
                Bucket: s3Config.bucket,
                Key: file.key,
              })
            );
            const bodyStream = s3Obj.Body as Readable;
            if (!bodyStream || typeof bodyStream.pipe !== 'function') {
              throw new Error('Invalid S3 stream');
            }

            const fileName = normalizeFileName(file.originalName || path.basename(file.key), index);

            await new Promise<void>((resolveFile, rejectFile) => {
              archive.append(bodyStream, {
                name: fileName,
                date: new Date(),
                size: file.size,
              } as any);

              bodyStream.once('end', () => resolveFile());
              bodyStream.once('error', (err) => rejectFile(err));
            });

            successCount++;
            if (successCount % 10 === 0 || successCount === files.length) {
              console.log(`[${jobId}] Progress: ${successCount}/${files.length} files processed`);
            }

            return;
          } catch (error) {
            attempt++;
            if (attempt >= retries) {
              console.error(`[${jobId}] File ${index + 1} failed after ${retries} attempts:`, error);
            } else {
              await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
          }
        }
      };

      await Promise.all(files.map((file, index) => limit(() => processFile(file, index))));

      if (successCount === 0) {
        cleanup();
        if (!isCompleted) {
          isCompleted = true;
          reject(new Error('No files were successfully processed'));
        }
        return;
      }

      console.log(`[${jobId}] Processing complete: ${successCount}/${files.length} files`);
      console.log(`[${jobId}] Finalizing archive...`);

      const finalizeTimeout = setTimeout(() => {
        if (!isCompleted) {
          isCompleted = true;
          console.error(`[${jobId}] Archive finalization timed out after 60 seconds`);
          cleanup();
          reject(new Error('Archive finalization timed out'));
        }
      }, 60000);

      try {
        await archive.finalize();
        clearTimeout(finalizeTimeout);
        console.log(`[${jobId}] Archive finalized successfully`);
      } catch (finalizeError) {
        clearTimeout(finalizeTimeout);
        if (!isCompleted) {
          isCompleted = true;
          console.error(`[${jobId}] Finalization error:`, finalizeError);
          cleanup();
          reject(finalizeError);
        }
      }

    } catch (err) {
      console.error(`[${jobId}] Processing error:`, err);
      cleanup();
      if (!isCompleted) {
        isCompleted = true;
        reject(err);
      }
    }
  });
}

function normalizeFileName(fileName: string, index: number): string {
  fileName = fileName || `file-${index + 1}`;

  if (fileName.toLowerCase().endsWith('.heic')) {
    fileName = fileName.replace(/\.heic$/i, '.jpg');
  }
  if (fileName.toLowerCase().endsWith('.mov')) {
    fileName = fileName.replace(/\.mov$/i, '.mp4');
  }

  fileName = fileName.replace(/[^\w\-_.]/g, '_');

  if (fileName.length > 100) {
    const ext = path.extname(fileName);
    const base = path.basename(fileName, ext);
    fileName = base.substring(0, 100 - ext.length) + ext;
  }

  if (!path.extname(fileName)) {
    fileName += '.bin';
  }

  return `${String(index + 1).padStart(3, '0')}_${fileName}`;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Use ES6 export instead of CommonJS
export default enhancedZipTask;