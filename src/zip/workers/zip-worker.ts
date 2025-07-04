import * as archiver from 'archiver';
import * as fs from 'fs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { pipeline } from 'stream/promises';
import { createWriteStream } from 'fs';

interface ZipTaskParams {
  fileUrls: string[];
  zipFileName?: string;
  jobId?: string;
  streaming?: boolean;
  batchSize?: number;
  maxRetries?: number;
}

interface ZipResult {
  filePath: string;
  fileSize: number;
  successCount: number;
  totalCount: number;
  processingTime?: number;
}

/**
 * Optimized zip worker for streaming with enhanced performance
 * Features:
 * - Optimized for direct streaming (smaller batches, faster response)
 * - Memory-efficient processing for large files
 * - Parallel file downloading with smart concurrency
 * - Enhanced error handling and retry mechanism
 * - HEIC/MOV file extension conversion
 */
export default async function zipTask(params: ZipTaskParams): Promise<ZipResult> {
  const { 
    fileUrls, 
    zipFileName, 
    jobId, 
    streaming = false,
    batchSize = streaming ? 3 : 5, // Smaller batches for streaming
    maxRetries = streaming ? 2 : 3  // Fewer retries for faster response
  } = params;
  
  const startTime = Date.now();

  if (!fileUrls || fileUrls.length === 0) {
    throw new Error('No file URLs provided');
  }

  console.log(`[${jobId}] Starting ${streaming ? 'streaming' : 'standard'} zip processing for ${fileUrls.length} files`);

  return new Promise(async (resolve, reject) => {
    const fileName = zipFileName || `archive-${uuidv4()}.zip`;
    const tempDir = path.resolve(__dirname, '../../tmp');

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempPath = path.join(tempDir, fileName);
    const output = createWriteStream(tempPath, { 
      highWaterMark: streaming ? 32 * 1024 : 64 * 1024 // Smaller buffer for streaming
    });
    
    // Configure archiver for optimal performance
    const archive = archiver('zip', {
      zlib: { 
        level: streaming ? 3 : 6, // Faster compression for streaming
        chunkSize: streaming ? 16 * 1024 : 32 * 1024
      },
      forceLocalTime: true,
      comment: `Created by Optimized Zip Service - Job: ${jobId || 'unknown'}`
    });

    let isFinalized = false;
    let successCount = 0;
    let processedCount = 0;

    // Enhanced cleanup function
    const cleanup = () => {
      if (fs.existsSync(tempPath)) {
        try {
          fs.unlinkSync(tempPath);
        } catch (error) {
          console.warn(`[${jobId}] Failed to cleanup temp file: ${error.message}`);
        }
      }
    };

    // Handle completion
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
          console.log(`  - Mode: ${streaming ? 'streaming' : 'standard'}`);
          
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

    // Error handlers
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
      // Process files with optimized concurrency
      const REQUEST_TIMEOUT = streaming ? 30000 : 60000; // Shorter timeout for streaming

      for (let i = 0; i < fileUrls.length; i += batchSize) {
        const batch = fileUrls.slice(i, i + batchSize);
        
        // Process batch concurrently with optimized settings
        await Promise.allSettled(
          batch.map(async (fileUrl, batchIndex) => {
            const fileIndex = i + batchIndex;
            let attempts = 0;
            let lastError: any;

            while (attempts < maxRetries) {
              try {
                await processFileOptimized(
                  fileUrl, 
                  fileIndex, 
                  archive, 
                  jobId, 
                  REQUEST_TIMEOUT,
                  streaming
                );
                successCount++;
                processedCount++;
                
                // More frequent progress updates for streaming
                const logInterval = streaming ? 5 : 10;
                if (processedCount % logInterval === 0 || processedCount === fileUrls.length) {
                  console.log(`[${jobId}] Progress: ${processedCount}/${fileUrls.length} files processed (${successCount} successful)`);
                }
                
                return; // Success, exit retry loop
              } catch (error) {
                attempts++;
                lastError = error;
                
                if (attempts < maxRetries) {
                  // Shorter wait time for streaming
                  const backoffTime = streaming ? 500 : 1000;
                  await new Promise(resolve => setTimeout(resolve, backoffTime * attempts));
                } else {
                  console.error(`[${jobId}] File ${fileIndex + 1} permanently failed:`, lastError.message);
                }
              }
            }
            
            processedCount++;
          })
        );

        // Smaller delay between batches for streaming
        if (i + batchSize < fileUrls.length) {
          await new Promise(resolve => setTimeout(resolve, streaming ? 50 : 100));
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
 * Optimized file processing with streaming enhancements
 */
async function processFileOptimized(
  fileUrl: string, 
  fileIndex: number, 
  archive: archiver.Archiver,
  jobId?: string,
  timeout: number = 30000,
  streaming: boolean = false
): Promise<void> {
  const decodedUrl = decodeURIComponent(fileUrl);

  // Enhanced HTTP client configuration for streaming
  const axiosConfig = {
    responseType: 'stream' as const,
    timeout,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    headers: {
      'User-Agent': 'OptimizedZipService/2.0',
      'Accept': '*/*',
      'Connection': 'keep-alive',
      'Accept-Encoding': streaming ? 'identity' : 'gzip, deflate' // Skip compression for streaming
    },
    decompress: !streaming, // Skip decompression for streaming to save CPU
    validateStatus: (status: number) => status === 200,
  };

  const response = await axios.get(decodedUrl, axiosConfig);

  // Enhanced filename extraction and normalization
  let fileName = extractOptimizedFileName(decodedUrl, fileIndex);
  fileName = normalizeFileNameEnhanced(fileName);
  
  // Add index prefix to ensure uniqueness and ordering
  fileName = `${String(fileIndex + 1).padStart(3, '0')}_${fileName}`;

  // Get content length for logging
  const contentLength = parseInt(response.headers['content-length'] || '0');
  if (contentLength > 0 && !streaming) {
    console.log(`[${jobId}] File ${fileIndex + 1} size: ${formatFileSize(contentLength)}`);
  }

  // Enhanced stream error handling
  const fileStream = response.data;
  fileStream.on('error', (streamError: any) => {
    throw new Error(`Stream error: ${streamError.message}`);
  });

  // Add to archive with optimized metadata
  archive.append(fileStream, { 
    name: fileName,
    date: new Date(),
    mode: 0o644 // Standard file permissions
  });

  if (streaming || fileIndex % 10 === 0) {
    console.log(`[${jobId}] File ${fileIndex + 1} added: ${fileName}`);
  }
}

/**
 * Enhanced filename extraction with better URL parsing
 */
function extractOptimizedFileName(url: string, fallbackIndex: number): string {
  try {
    const urlPath = new URL(url).pathname;
    const pathSegments = urlPath.split('/').filter(segment => segment.length > 0);
    
    if (pathSegments.length > 0) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      const cleanName = lastSegment.split('?')[0].split('#')[0];
      
      if (cleanName && cleanName.length > 0 && cleanName !== '/') {
        return cleanName;
      }
    }
    
    // Try to extract from query parameters (common in CDN URLs)
    const urlObj = new URL(url);
    const filename = urlObj.searchParams.get('filename') || 
                    urlObj.searchParams.get('file') ||
                    urlObj.searchParams.get('name');
    
    if (filename) {
      return filename;
    }
    
  } catch (error) {
    console.warn(`Failed to extract filename from URL: ${url.substring(0, 100)}...`);
  }
  
  return `file-${fallbackIndex + 1}`;
}

/**
 * Enhanced filename normalization with better extension handling
 */
function normalizeFileNameEnhanced(fileName: string): string {
  // Enhanced extension mapping
  const extensionMap: { [key: string]: string } = {
    '.heic': '.jpg',
    '.HEIC': '.jpg',
    '.mov': '.mp4',
    '.MOV': '.mp4',
    '.jpeg': '.jpg',
    '.JPEG': '.jpg',
    '.tiff': '.tif',
    '.TIFF': '.tif'
  };

  // Apply extension mapping
  for (const [oldExt, newExt] of Object.entries(extensionMap)) {
    if (fileName.toLowerCase().endsWith(oldExt.toLowerCase())) {
      fileName = fileName.slice(0, -oldExt.length) + newExt;
      break;
    }
  }

  // Enhanced filename sanitization
  fileName = fileName
    .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  
  // Ensure filename length is reasonable
  const maxLength = 100;
  if (fileName.length > maxLength) {
    const ext = path.extname(fileName);
    const base = path.basename(fileName, ext);
    fileName = base.substring(0, maxLength - ext.length) + ext;
  }

  // Ensure we have an extension
  if (!path.extname(fileName)) {
    fileName += '.bin';
  }

  // Ensure filename is not empty
  if (!fileName || fileName === '.bin') {
    fileName = 'unknown_file.bin';
  }

  return fileName;
}

/**
 * Optimized file size formatting
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Export for CommonJS compatibility
module.exports = zipTask;