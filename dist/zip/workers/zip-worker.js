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
    const { fileUrls, zipFileName, jobId } = params;
    const startTime = Date.now();
    if (!fileUrls || fileUrls.length === 0) {
        throw new Error('No file URLs provided');
    }
    console.log(`[${jobId}] Starting zip processing for ${fileUrls.length} files`);
    return new Promise(async (resolve, reject) => {
        const fileName = zipFileName || `archive-${(0, uuid_1.v4)()}.zip`;
        const tempDir = path.resolve(__dirname, '../../tmp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        const tempPath = path.join(tempDir, fileName);
        const output = (0, fs_1.createWriteStream)(tempPath);
        const archive = archiver('zip', {
            zlib: { level: 0 },
            forceLocalTime: true,
        });
        let isFinalized = false;
        let successCount = 0;
        let processedCount = 0;
        let isCompleted = false;
        const cleanup = () => {
            if (fs.existsSync(tempPath)) {
                try {
                    fs.unlinkSync(tempPath);
                }
                catch (error) {
                    console.warn(`[${jobId}] Cleanup failed:`, error.message);
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
                    console.log(`[${jobId}] Files: ${successCount}/${fileUrls.length} successful`);
                    resolve({
                        filePath: tempPath,
                        fileSize: stats.size,
                        successCount,
                        totalCount: fileUrls.length,
                    });
                }
                catch (error) {
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
                console.warn(`[${jobId}] Warning:`, err.message);
            }
            else {
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
            const BATCH_SIZE = 5;
            const MAX_RETRIES = 2;
            const REQUEST_TIMEOUT = 30000;
            for (let i = 0; i < fileUrls.length; i += BATCH_SIZE) {
                const batch = fileUrls.slice(i, i + BATCH_SIZE);
                await Promise.allSettled(batch.map(async (fileUrl, batchIndex) => {
                    const fileIndex = i + batchIndex;
                    let attempts = 0;
                    while (attempts < MAX_RETRIES) {
                        try {
                            await processFile(fileUrl, fileIndex, archive, REQUEST_TIMEOUT);
                            successCount++;
                            processedCount++;
                            if (processedCount % 20 === 0 || processedCount === fileUrls.length) {
                                console.log(`[${jobId}] Progress: ${processedCount}/${fileUrls.length} files processed`);
                            }
                            return;
                        }
                        catch (error) {
                            attempts++;
                            if (attempts >= MAX_RETRIES) {
                                console.error(`[${jobId}] File ${fileIndex + 1} failed:`, error.message);
                            }
                        }
                    }
                    processedCount++;
                }));
                if (i + BATCH_SIZE < fileUrls.length) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                }
            }
            if (successCount === 0) {
                cleanup();
                if (!isCompleted) {
                    isCompleted = true;
                    reject(new Error('No files were successfully processed'));
                }
                return;
            }
            console.log(`[${jobId}] Processing complete: ${successCount}/${fileUrls.length} files`);
            console.log(`[${jobId}] Finalizing archive...`);
            const finalizeTimeout = setTimeout(() => {
                if (!isCompleted) {
                    isCompleted = true;
                    console.error(`[${jobId}] Archive finalization timed out after 60 seconds`);
                    cleanup();
                    reject(new Error('Archive finalization timed out'));
                }
            }, 60000);
            isFinalized = true;
            try {
                await archive.finalize();
                clearTimeout(finalizeTimeout);
                console.log(`[${jobId}] Archive finalized successfully`);
            }
            catch (finalizeError) {
                clearTimeout(finalizeTimeout);
                if (!isCompleted) {
                    isCompleted = true;
                    console.error(`[${jobId}] Finalization error:`, finalizeError);
                    cleanup();
                    reject(finalizeError);
                }
            }
        }
        catch (err) {
            console.error(`[${jobId}] Processing error:`, err);
            cleanup();
            if (!isCompleted) {
                isCompleted = true;
                reject(err);
            }
        }
    });
}
async function processFile(fileUrl, fileIndex, archive, timeout = 30000) {
    const decodedUrl = decodeURIComponent(fileUrl);
    const response = await axios_1.default.get(decodedUrl, {
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
    return new Promise((resolve, reject) => {
        fileStream.on('error', (streamError) => {
            reject(new Error(`Stream error: ${streamError.message}`));
        });
        try {
            archive.append(fileStream, {
                name: fileName,
                date: new Date()
            });
            resolve();
        }
        catch (appendError) {
            reject(appendError);
        }
    });
}
function extractFileName(url, fallbackIndex) {
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
    }
    catch (error) {
    }
    return `file-${fallbackIndex + 1}`;
}
function normalizeFileName(fileName) {
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