import { parentPort, workerData } from 'worker_threads';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import pLimit from 'p-limit';

interface WorkerData {
  files: any[];
  tempZipPath: string;
  s3Config: {
    region: string;
    endpoint: string;
    credentials: {
      accessKeyId: string;
      secretAccessKey: string;
    };
  };
  bucketName: string;
  jobId: string;
  maxConcurrentDownloads: number;
}

function toNodeReadable(readableStream: ReadableStream<Uint8Array>): Readable {
  const reader = readableStream.getReader();
  return new Readable({
    async read() {
      try {
        const { done, value } = await reader.read();
        if (done) {
          this.push(null);
        } else {
          this.push(Buffer.from(value));
        }
      } catch (err) {
        this.destroy(err);
      }
    },
  });
}

async function enhancedZipTask(data: WorkerData): Promise<void> {
  const { files, tempZipPath, s3Config, bucketName, jobId, maxConcurrentDownloads } = data;

  return new Promise<void>((resolve, reject) => {
    const s3 = new S3Client({
      region: s3Config.region,
      endpoint: s3Config.endpoint,
      credentials: s3Config.credentials,
      forcePathStyle: true,
    });

    const output = fs.createWriteStream(tempZipPath);
    const archive = archiver('zip', { zlib: { level: 1 } });

    let isCompleted = false;
    let processedFiles = 0;

    const cleanup = () => {
      try {
        if (fs.existsSync(tempZipPath)) {
          fs.unlinkSync(tempZipPath);
        }
      } catch (err) {
        console.error(`[${jobId}] Cleanup error:`, err);
      }
    };

    output.on('close', () => {
      if (!isCompleted) {
        isCompleted = true;
        console.log(`[${jobId}] Worker completed successfully. Processed ${processedFiles}/${files.length} files.`);
        resolve();
      }
    });

    archive.on('error', (err) => {
      cleanup();
      if (!isCompleted) {
        isCompleted = true;
        console.error(`[${jobId}] Archive error:`, err.message);
        reject(new Error(`Archive error: ${err.message}`));
      }
    });

    output.on('error', (err) => {
      cleanup();
      if (!isCompleted) {
        isCompleted = true;
        console.error(`[${jobId}] Output stream error:`, err.message);
        reject(new Error(`Output stream error: ${err.message}`));
      }
    });

    archive.pipe(output);

    const limit = pLimit(maxConcurrentDownloads);
    const retries = 3;

    const processFile = async (file: typeof files[0], index: number) => {
      let attempt = 0;

      while (attempt < retries) {
        try {
          console.log(`[${jobId}] Processing file ${index + 1}/${files.length}: ${file.key} (attempt ${attempt + 1})`);

          const s3Obj = await s3.send(
            new GetObjectCommand({
              Bucket: bucketName,
              Key: file.key,
            })
          );

          const nodeStream = toNodeReadable(s3Obj.Body as ReadableStream<Uint8Array>);

          archive.append(nodeStream, {
            name: file.originalName || path.basename(file.key),
          });

          processedFiles++;
          console.log(`[${jobId}] Successfully processed file ${index + 1}/${files.length}`);

          // Send progress update to parent
          if (parentPort) {
            parentPort.postMessage({
              type: 'progress',
              processed: processedFiles,
              total: files.length,
            });
          }

          break;
        } catch (error) {
          attempt++;
          const properError = error instanceof Error ? error : new Error(String(error));
          console.error(`[${jobId}] File processing error:`, properError.message);

          if (attempt >= retries) {
            console.error(`[${jobId}] File ${index + 1} failed after ${retries} attempts:`, properError.message);
          } else {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          }
        }
      }
    };

    const processFiles = async () => {
      try {
        await Promise.all(files.map((file, index) => limit(() => processFile(file, index))));

        console.log(`[${jobId}] All files processed, finalizing archive...`);
        archive.finalize();
      } catch (err) {
        const properError = err instanceof Error ? err : new Error(String(err));
        console.error(`[${jobId}] Processing error:`, properError.message);
        cleanup();
        if (!isCompleted) {
          isCompleted = true;
          reject(properError);
        }
      }
    };

    processFiles();
  });
}

// Worker execution
if (parentPort) {
  enhancedZipTask(workerData)
    .then(() => {
      parentPort!.postMessage({ type: 'success' });
    })
    .catch((error) => {
      const properError = error instanceof Error ? error : new Error(String(error));
      parentPort!.postMessage({
        type: 'error',
        message: properError.message
      });
    });
}
