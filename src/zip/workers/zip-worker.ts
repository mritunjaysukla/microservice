import * as archiver from 'archiver';
import * as fs from 'fs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export default function zipTask({
  fileUrls,
  zipFileName,
}: {
  fileUrls: string[];
  zipFileName?: string;
}): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const fileName = zipFileName || `archive-${uuidv4()}.zip`;
    const tempDir = path.resolve(__dirname, '../../tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    const tempPath = path.join(tempDir, fileName);

    const output = fs.createWriteStream(tempPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      resolve(tempPath);
    });

    output.on('error', (err) => {
      reject(err);
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);

    try {
      for (const fileUrl of fileUrls) {
        try {
          const decodedUrl = decodeURIComponent(fileUrl);
          const response = await axios.get(decodedUrl, { responseType: 'stream' });

          let name = decodedUrl.split('/').pop() || `file-${uuidv4()}`;
          name = name.replace(/\.(heic|mov)$/i, '.jpg');

          archive.append(response.data, { name });
        } catch (err) {
          console.error(`Failed to append ${fileUrl}:`, err.message);
        }
      }

      await archive.finalize();
      // The 'close' event on output stream will resolve the promise
    } catch (err) {
      reject(err);
    }
  });
}
