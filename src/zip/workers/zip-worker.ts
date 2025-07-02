import * as archiver from 'archiver';
import * as fs from 'fs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

interface ZipTaskParams {
  fileUrls: string[];
  zipFileName?: string;
}

export default async function zipTask(params: ZipTaskParams): Promise<string> {
  const { fileUrls, zipFileName } = params;

  if (!fileUrls || fileUrls.length === 0) {
    throw new Error('No file URLs provided');
  }

  return new Promise(async (resolve, reject) => {
    const fileName = zipFileName || `archive-${uuidv4()}.zip`;
    const tempDir = path.resolve(__dirname, '../../tmp');

    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempPath = path.join(tempDir, fileName);

    const output = fs.createWriteStream(tempPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    let isFinalized = false;

    output.on('close', () => {
      if (!isFinalized) {
        console.log(`Archive created: ${tempPath} (${archive.pointer()} bytes)`);
        resolve(tempPath);
      }
    });

    output.on('error', (err) => {
      console.error('Output stream error:', err);
      reject(err);
    });

    archive.on('error', (err) => {
      console.error('Archive error:', err);
      reject(err);
    });

    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Archive warning:', err);
      } else {
        reject(err);
      }
    });

    archive.pipe(output);

    try {
      let successCount = 0;

      for (let i = 0; i < fileUrls.length; i++) {
        const fileUrl = fileUrls[i];
        try {
          const decodedUrl = decodeURIComponent(fileUrl);
          console.log(`Processing file ${i + 1}/${fileUrls.length}: ${decodedUrl}`);

          const response = await axios.get(decodedUrl, {
            responseType: 'stream',
            timeout: 30000, // 30 seconds timeout per file
            maxContentLength: 100 * 1024 * 1024, // 100MB max file size
          });

          let name = decodedUrl.split('/').pop() || `file-${uuidv4()}`;

          // Replace extensions as needed
          name = name.replace(/\.(heic|mov)$/i, '.jpg');

          // Ensure unique filename in case of duplicates
          const baseName = path.parse(name).name;
          const extension = path.parse(name).ext;
          name = `${baseName}_${i + 1}${extension}`;

          archive.append(response.data, { name });
          successCount++;
        } catch (err) {
          console.error(`Failed to append ${fileUrl}:`, err.message);
          // Continue processing other files instead of failing completely
        }
      }

      if (successCount === 0) {
        reject(new Error('No files were successfully processed'));
        return;
      }

      console.log(`Successfully processed ${successCount}/${fileUrls.length} files`);

      isFinalized = true;
      await archive.finalize();

    } catch (err) {
      console.error('Error during archive creation:', err);
      reject(err);
    }
  });
}

// For CommonJS compatibility
module.exports = zipTask;