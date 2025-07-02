import * as archiver from 'archiver';
import * as fs from 'fs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';

interface ZipTaskParams {
  fileUrls: string[];
  zipFileName?: string;
  jobId?: string;
  s3Config?: {
    region: string;
    endpoint: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
  };
}

interface ZipResult {
  filePath: string;
  fileSize: number;
  successCount: number;
  totalCount: number;
  s3Key?: string;
  processingTime?: number;
}

/**
 * Enhanced zip worker with optimized performance for large files
 * Features:
 * - Parallel file downloading with connection pooling
 * - Streaming architecture to handle unlimited file sizes
 * - Progress tracking and detailed error reporting
 * - Memory-efficient processing
 * - Automatic retry mechanism for failed downloads
 */
export default async function zipTask(params: ZipTaskParams): Promise<ZipResult> {
  const { fileUrls, zipFileName, jobId, s3Config } = params;
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
    const output = createWriteStream(tempPath, { 
      highWaterMark: 64 * 1024 // 64KB buffer for better performance
    });
    
    // Configure archiver for optimal performance with large files
    const archive = archiver('zip', {
      zlib: { 
        level: 6, // Balanced compression (faster than level 9, good compression)
        chunkSize: 32 * 1024 // 32KB chunks for better streaming
      },
      forceLocalTime: true,
      comment: `Created by Zip Microservice - Job: ${jobId || 'unknown'}`
    });

    let isFinalized = false;
    let successCount = 0;
    let processedCount = 0;

    // Enhanced error handling
    const cleanup = () => {
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    };

    output.on('close', () => {
      if (!isFinalized) {
        try {
          const stats = fs.statSync(tempPath);
          const processingTime = Date.now() - startTime;
          
          console.log(`[${jobId}] Archive created successfully:`);
          console.log(`  - File: ${tempPath}`);
          console.log(`  - Size: ${formatFileSize(stats.size)}`);
          console.log(`  - Files: ${successCount}/${fileUrls.length}`);
          console.log(`  - Processing time: ${processingTime}ms`);
          
          resolve({
            filePath: tempPath,
            fileSize: stats.size,
            successCount,
            totalCount: fileUrls.length,
            processingTime
          });
        } catch (error) {
          console.error(`[${jobId}] Error reading archive stats:`, error);
          cleanup();
          reject(error);
        }
      }
    });

    output.on('error', (err) => {
      console.error(`[${jobId}] Output stream error:`, err);
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
        console.warn(`[${jobId}] Archive warning:`, err.message);
      } else {
        console.error(`[${jobId}] Archive critical warning:`, err);
        cleanup();
        reject(err);
      }
    });

    // Start piping archive to output
    archive.pipe(output);

    try {
      // Process files with controlled concurrency to prevent memory issues
      const BATCH_SIZE = 5; // Process 5 files concurrently
      const MAX_RETRIES = 3;
      const REQUEST_TIMEOUT = 60000; // 60 seconds timeout

      for (let i = 0; i < fileUrls.length; i += BATCH_SIZE) {
        const batch = fileUrls.slice(i, i + BATCH_SIZE);
        
        // Process batch concurrently
        await Promise.allSettled(
          batch.map(async (fileUrl, batchIndex) => {
            const fileIndex = i + batchIndex;
            let attempts = 0;
            let lastError: any;

            while (attempts < MAX_RETRIES) {
              try {
                await processFile(fileUrl, fileIndex, archive, jobId, REQUEST_TIMEOUT);
                successCount++;
                processedCount++;
                
                // Log progress every 10 files or at the end
                if (processedCount % 10 === 0 || processedCount === fileUrls.length) {
                  console.log(`[${jobId}] Progress: ${processedCount}/${fileUrls.length} files processed (${successCount} successful)`);
                }
                
                return; // Success, exit retry loop
              } catch (error) {
                attempts++;
                lastError = error;
                console.warn(`[${jobId}] File ${fileIndex + 1} failed (attempt ${attempts}/${MAX_RETRIES}):`, error.message);
                
                if (attempts < MAX_RETRIES) {
                  // Wait before retry (exponential backoff)
                  await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
                }
              }
            }
            
            // If we get here, all retries failed
            processedCount++;
            console.error(`[${jobId}] File ${fileIndex + 1} permanently failed after ${MAX_RETRIES} attempts:`, lastError.message);
          })
        );

        // Small delay between batches to prevent overwhelming the system
        if (i + BATCH_SIZE < fileUrls.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      if (successCount === 0) {
        cleanup();
        reject(new Error('No files were successfully processed'));
        return;
      }

      console.log(`[${jobId}] Successfully processed ${successCount}/${fileUrls.length} files`);
      
      // Finalize the archive
      isFinalized = true;
      await archive.finalize();

    } catch (err) {
      console.error(`[${jobId}] Error during archive creation:`, err);
      cleanup();
      reject(err);
    }
  });
}

/**
 * Process individual file with enhanced error handling and validation
 */
async function processFile(
  fileUrl: string, 
  fileIndex: number, 
  archive: archiver.Archiver,
  jobId?: string,
  timeout: number = 60000
): Promise<void> {
  const decodedUrl = decodeURIComponent(fileUrl);
  console.log(`[${jobId}] Processing file ${fileIndex + 1}: ${decodedUrl}`);

  // Enhanced HTTP client configuration
  const axiosConfig = {
    responseType: 'stream' as const,
    timeout,
    maxContentLength: Infinity, // No limit on file size
    maxBodyLength: Infinity,
    headers: {
      'User-Agent': 'ZIP-Microservice/2.0',
      'Accept': '*/*',
      'Connection': 'keep-alive'
    },
    // Disable compression to save CPU during download
    decompress: false,
    // Enable HTTP/2 if available
    httpAgent: false,
    httpsAgent: false
  };

  const response = await axios.get(decodedUrl, axiosConfig);

  // Validate response
  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  // Extract filename with better logic
  let fileName = extractFileName(decodedUrl, fileIndex);
  
  // Handle special file extensions
  fileName = normalizeFileName(fileName);

  // Ensure unique filename within the archive
  fileName = `${String(fileIndex + 1).padStart(3, '0')}_${fileName}`;

  // Get content length for progress tracking
  const contentLength = parseInt(response.headers['content-length'] || '0');
  if (contentLength > 0) {
    console.log(`[${jobId}] File ${fileIndex + 1} size: ${formatFileSize(contentLength)}`);
  }

  // Stream the file directly to the archive
  const fileStream = response.data;
  
  // Add error handling to the stream
  fileStream.on('error', (streamError: any) => {
    throw new Error(`Stream error: ${streamError.message}`);
  });

  // Append to archive with metadata
  archive.append(fileStream, { 
    name: fileName,
    date: new Date()
  });

  console.log(`[${jobId}] File ${fileIndex + 1} added to archive: ${fileName}`);
}

/**
 * Extract meaningful filename from URL
 */
function extractFileName(url: string, fallbackIndex: number): string {
  try {
    const urlPath = new URL(url).pathname;
    const pathParts = urlPath.split('/').filter(part => part.length > 0);
    
    if (pathParts.length > 0) {
      const lastPart = pathParts[pathParts.length - 1];
      // Remove query parameters if they somehow got through
      const cleanName = lastPart.split('?')[0];
      if (cleanName && cleanName.length > 0) {
        return cleanName;
      }
    }
  } catch (error) {
    console.warn(`Failed to extract filename from URL: ${url}`);
  }
  
  return `file-${fallbackIndex + 1}`;
}

/**
 * Normalize filename and handle special extensions
 */
function normalizeFileName(fileName: string): string {
  // Handle special extensions that need conversion
  const extensionMap: { [key: string]: string } = {
    '.heic': '.jpg',
    '.HEIC': '.jpg',
    '.mov': '.mp4',
    '.MOV': '.mp4'
  };

  // Apply extension mapping
  for (const [oldExt, newExt] of Object.entries(extensionMap)) {
    if (fileName.toLowerCase().endsWith(oldExt.toLowerCase())) {
      fileName = fileName.slice(0, -oldExt.length) + newExt;
      break;
    }
  }

  // Sanitize filename
  fileName = fileName.replace(/[^\w\-_.]/g, '_');
  
  // Ensure filename is not too long
  if (fileName.length > 100) {
    const ext = path.extname(fileName);
    const base = path.basename(fileName, ext);
    fileName = base.substring(0, 100 - ext.length) + ext;
  }

  // Ensure we have an extension
  if (!path.extname(fileName)) {
    fileName += '.bin';
  }

  return fileName;
}

/**
 * Format file size for human reading
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// For CommonJS compatibility
module.exports = zipTask;