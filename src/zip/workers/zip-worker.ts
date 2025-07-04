import * as archiver from 'archiver';
import * as fs from 'fs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { createWriteStream } from 'fs';

interface ZipTaskParams {
  fileUrls: string[];
  zipFileName?: string;
  jobId?: string;
}

interface ZipResult {
  filePath: string;
  fileSize: number;
  successCount: number;
  totalCount: number;
}

/**
 * Fast zip worker with no compression for maximum speed
 */
export default async function zipTask(params: ZipTaskParams): Promise<ZipResult> {
  const { fileUrls, zipFileName, jobId } = params;
  const startTime = Date.now();

  if (!fileUrls || fileUrls.length === 0) {
    throw new Error('No file URLs provided');
  }

  console.log(`[${jobId}] Starting zip processing for ${fileUrls.length} files`);

  return new Promise(async (resolve, reject) => {
    const fileName = zipFileName || `archive-${uuidv4()}.zip`;
    const tempDir = path.resolve(__dirname, '../../tmp');

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempPath = path.join(tempDir, fileName);
    const output = createWriteStream(tempPath);

    // Configure archiver with NO compression for maximum speed
    const archive = archiver('zip', {
      zlib: { level: 0 }, // NO compression - store only
      forceLocalTime: true,
    });

    let isFinalized = false;
    let successCount = 0;
    let processedCount = 0;

    const cleanup = () => {
      if (fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch (error) {
          console.warn(`[${jobId}] Cleanup failed:`, error.message);
        }
      }
    };

    output.on('close', () => {
      if (!isFinalized) {
        try {
          const stats = fs.statSync(tempPath);
          const processingTime = Date.now() - startTime;

          console.log(`[${jobId}] Zip created: ${tempPath} (${formatFileSize(stats.size)}) in ${(processingTime / 1000).toFixed(1)}s`);
          console.log(`[${jobId}] Files: ${successCount}/${fileUrls.length} successful`);

          resolve({
            filePath: tempPath,
            fileSize: stats.size,
            successCount,
            totalCount: fileUrls.length,
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
      reject(err);
    });

    archive.on('error', (err) => {
      console.error(`[${jobId}] Archive error:`, err);
      cleanup();
      reject(err);
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn(`[${jobId}] Warning:`, err.message);
      } else {
        cleanup();
        reject(err);
      }
    });

    archive.pipe(output);

    try {
      // Process files in parallel batches for maximum speed
      const BATCH_SIZE = 5;
      const MAX_RETRIES = 2;
      const REQUEST_TIMEOUT = 30000;

      for (let i = 0; i < fileUrls.length; i += BATCH_SIZE) {
        const batch = fileUrls.slice(i, i + BATCH_SIZE);

        await Promise.allSettled(
          batch.map(async (fileUrl, batchIndex) => {
            const fileIndex = i + batchIndex;
            let attempts = 0;

            while (attempts < MAX_RETRIES) {
              try {
                await processFile(fileUrl, fileIndex, archive, REQUEST_TIMEOUT);
                successCount++;
                processedCount++;

                // Log progress every 20 files
                if (processedCount % 20 === 0 || processedCount === fileUrls.length) {
                  console.log(`[${jobId}] Progress: ${processedCount}/${fileUrls.length} files processed`);
                }

                return;
              } catch (error) {
                attempts++;
                if (attempts >= MAX_RETRIES) {
                  console.error(`[${jobId}] File ${fileIndex + 1} failed:`, error.message);
                }
              }
            }

            processedCount++;
          })
        );

        // Small delay between batches
        if (i + BATCH_SIZE < fileUrls.length) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      if (successCount === 0) {
        cleanup();
        reject(new Error('No files were successfully processed'));
        return;
      }

      console.log(`[${jobId}] Processing complete: ${successCount}/${fileUrls.length} files`);

      isFinalized = true;
      await archive.finalize();

    } catch (err) {
      console.error(`[${jobId}] Processing error:`, err);
      cleanup();
      reject(err);
    }
  });
}

async function processFile(
  fileUrl: string,
  fileIndex: number,
  archive: archiver.Archiver,
  timeout: number = 30000
): Promise<void> {
  const decodedUrl = decodeURIComponent(fileUrl);

  const response = await axios.get(decodedUrl, {
    responseType: 'stream',
    timeout,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: {
      'User-Agent': 'ZipService/1.0',
      'Accept': '*/*',
    },
  });

  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status}`);
  }

  let fileName = extractFileName(decodedUrl, fileIndex);
  fileName = normalizeFileName(fileName);
  fileName = `${String(fileIndex + 1).padStart(3, '0')}_${fileName}`;

  const fileStream = response.data;
  fileStream.on('error', (streamError: any) => {
    throw new Error(`Stream error: ${streamError.message}`);
  });

  archive.append(fileStream, {
    name: fileName,
    date: new Date()
  });
}

function extractFileName(url: string, fallbackIndex: number): string {
  try {
    const urlPath = new URL(url).pathname;
    const pathSegments = urlPath.split('/').filter(segment => segment.length > 0);

    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      const cleanName = lastSegment.split('?')[0];
      if (cleanName && cleanName.length > 0) {
        return cleanName;
      }
    }
  } catch (error) {
    // Ignore error, use fallback
  }

  return `file-${fallbackIndex + 1}`;
}

function normalizeFileName(fileName: string): string {
  // Handle HEIC and MOV extensions
  if (fileName.toLowerCase().endsWith('.heic')) {
    fileName = fileName.replace(/\.heic$/i, '.jpg');
  }
  if (fileName.toLowerCase().endsWith('.mov')) {
    fileName = fileName.replace(/\.mov$/i, '.mp4');
  }

  // Sanitize filename
  fileName = fileName.replace(/[^\w\-_.]/g, '_');

  // Ensure reasonable length
  if (fileName.length > 100) {
    const ext = path.extname(fileName);
    const base = path.basename(fileName, ext);
    fileName = base.substring(0, 100 - ext.length) + ext;
  }

  // Ensure extension
  if (!path.extname(fileName)) {
    fileName += '.bin';
  }

  return fileName;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

module.exports = zipTask;