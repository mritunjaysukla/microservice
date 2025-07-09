
import * as fs from 'fs';
import * as path from 'path';

export function cleanUpTempFiles(daysOld = 1) {
  const tmpDir = path.resolve(__dirname, '../../tmp');
  if (!fs.existsSync(tmpDir)) return;

  const now = Date.now();
  const cutoff = daysOld * 24 * 60 * 60 * 1000; // days in ms

  fs.readdir(tmpDir, (err, files) => {
    if (err) return console.error('Temp cleanup error:', err);

    files.forEach((file) => {
      const filePath = path.join(tmpDir, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return;

        if (now - stats.mtimeMs > cutoff) {
          fs.unlink(filePath, (err) => {
            if (err) console.error('Failed to delete temp file:', filePath);
            else console.log('Deleted old temp file:', filePath);
          });
        }
      });
    });
  });
}
