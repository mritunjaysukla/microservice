"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = zipTask;
const archiver = require("archiver");
const fs = require("fs");
const axios_1 = require("axios");
const uuid_1 = require("uuid");
const path = require("path");
const fs_1 = require("fs");
async function zipTask(params) {
    const { fileUrls, zipFileName, jobId, streaming = false, batchSize = streaming ? 3 : 5, maxRetries = streaming ? 2 : 3 } = params;
    const startTime = Date.now();
    if (!fileUrls || fileUrls.length === 0) {
        throw new Error('No file URLs provided');
    }
    console.log(`[${jobId}] Starting ${streaming ? 'streaming' : 'standard'} zip processing for ${fileUrls.length} files`);
    return new Promise(async (resolve, reject) => {
        const fileName = zipFileName || `archive-${(0, uuid_1.v4)()}.zip`;
        const tempDir = path.resolve(__dirname, '../../tmp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        const tempPath = path.join(tempDir, fileName);
        const output = (0, fs_1.createWriteStream)(tempPath, {
            highWaterMark: streaming ? 32 * 1024 : 64 * 1024
        });
        const archive = archiver('zip', {
            zlib: {
                level: streaming ? 3 : 6,
                chunkSize: streaming ? 16 * 1024 : 32 * 1024
            },
            forceLocalTime: true,
            comment: `Created by Optimized Zip Service - Job: ${jobId || 'unknown'}`
        });
        let isFinalized = false;
        let successCount = 0;
        let processedCount = 0;
        const cleanup = () => {
            if (fs.existsSync(tempPath)) {
                try {
                    fs.unlinkSync(tempPath);
                }
                catch (error) {
                    console.warn(`[${jobId}] Failed to cleanup temp file: ${error.message}`);
                }
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
                    console.log(`  - Mode: ${streaming ? 'streaming' : 'standard'}`);
                    resolve({
                        filePath: tempPath,
                        fileSize: stats.size,
                        successCount,
                        totalCount: fileUrls.length,
                        processingTime
                    });
                }
                catch (error) {
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
            }
            else {
                console.error(`[${jobId}] Archive critical warning:`, err);
                cleanup();
                reject(err);
            }
        });
        archive.pipe(output);
        try {
            const REQUEST_TIMEOUT = streaming ? 30000 : 60000;
            for (let i = 0; i < fileUrls.length; i += batchSize) {
                const batch = fileUrls.slice(i, i + batchSize);
                await Promise.allSettled(batch.map(async (fileUrl, batchIndex) => {
                    const fileIndex = i + batchIndex;
                    let attempts = 0;
                    let lastError;
                    while (attempts < maxRetries) {
                        try {
                            await processFileOptimized(fileUrl, fileIndex, archive, jobId, REQUEST_TIMEOUT, streaming);
                            successCount++;
                            processedCount++;
                            const logInterval = streaming ? 5 : 10;
                            if (processedCount % logInterval === 0 || processedCount === fileUrls.length) {
                                console.log(`[${jobId}] Progress: ${processedCount}/${fileUrls.length} files processed (${successCount} successful)`);
                            }
                            return;
                        }
                        catch (error) {
                            attempts++;
                            lastError = error;
                            if (attempts < maxRetries) {
                                const backoffTime = streaming ? 500 : 1000;
                                await new Promise(resolve => setTimeout(resolve, backoffTime * attempts));
                            }
                            else {
                                console.error(`[${jobId}] File ${fileIndex + 1} permanently failed:`, lastError.message);
                            }
                        }
                    }
                    processedCount++;
                }));
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
            isFinalized = true;
            await archive.finalize();
        }
        catch (err) {
            console.error(`[${jobId}] Error during archive creation:`, err);
            cleanup();
            reject(err);
        }
    });
}
async function processFileOptimized(fileUrl, fileIndex, archive, jobId, timeout = 30000, streaming = false) {
    const decodedUrl = decodeURIComponent(fileUrl);
    const axiosConfig = {
        responseType: 'stream',
        timeout,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: {
            'User-Agent': 'OptimizedZipService/2.0',
            'Accept': '*/*',
            'Connection': 'keep-alive',
            'Accept-Encoding': streaming ? 'identity' : 'gzip, deflate'
        },
        decompress: !streaming,
        validateStatus: (status) => status === 200,
    };
    const response = await axios_1.default.get(decodedUrl, axiosConfig);
    let fileName = extractOptimizedFileName(decodedUrl, fileIndex);
    fileName = normalizeFileNameEnhanced(fileName);
    fileName = `${String(fileIndex + 1).padStart(3, '0')}_${fileName}`;
    const contentLength = parseInt(response.headers['content-length'] || '0');
    if (contentLength > 0 && !streaming) {
        console.log(`[${jobId}] File ${fileIndex + 1} size: ${formatFileSize(contentLength)}`);
    }
    const fileStream = response.data;
    fileStream.on('error', (streamError) => {
        throw new Error(`Stream error: ${streamError.message}`);
    });
    archive.append(fileStream, {
        name: fileName,
        date: new Date(),
        mode: 0o644
    });
    if (streaming || fileIndex % 10 === 0) {
        console.log(`[${jobId}] File ${fileIndex + 1} added: ${fileName}`);
    }
}
function extractOptimizedFileName(url, fallbackIndex) {
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
        const urlObj = new URL(url);
        const filename = urlObj.searchParams.get('filename') ||
            urlObj.searchParams.get('file') ||
            urlObj.searchParams.get('name');
        if (filename) {
            return filename;
        }
    }
    catch (error) {
        console.warn(`Failed to extract filename from URL: ${url.substring(0, 100)}...`);
    }
    return `file-${fallbackIndex + 1}`;
}
function normalizeFileNameEnhanced(fileName) {
    const extensionMap = {
        '.heic': '.jpg',
        '.HEIC': '.jpg',
        '.mov': '.mp4',
        '.MOV': '.mp4',
        '.jpeg': '.jpg',
        '.JPEG': '.jpg',
        '.tiff': '.tif',
        '.TIFF': '.tif'
    };
    for (const [oldExt, newExt] of Object.entries(extensionMap)) {
        if (fileName.toLowerCase().endsWith(oldExt.toLowerCase())) {
            fileName = fileName.slice(0, -oldExt.length) + newExt;
            break;
        }
    }
    fileName = fileName
        .replace(/[<>:"/\\|?*]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_|_$/g, '');
    const maxLength = 100;
    if (fileName.length > maxLength) {
        const ext = path.extname(fileName);
        const base = path.basename(fileName, ext);
        fileName = base.substring(0, maxLength - ext.length) + ext;
    }
    if (!path.extname(fileName)) {
        fileName += '.bin';
    }
    if (!fileName || fileName === '.bin') {
        fileName = 'unknown_file.bin';
    }
    return fileName;
}
function formatFileSize(bytes) {
    if (bytes === 0)
        return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
module.exports = zipTask;
//# sourceMappingURL=zip-worker.js.map