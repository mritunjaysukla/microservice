"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = zipTask;
const archiver = require("archiver");
const fs = require("fs");
const axios_1 = require("axios");
const uuid_1 = require("uuid");
const path = require("path");
function zipTask({ fileUrls, zipFileName, }) {
    return new Promise(async (resolve, reject) => {
        const fileName = zipFileName || `archive-${(0, uuid_1.v4)()}.zip`;
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
                    const response = await axios_1.default.get(decodedUrl, { responseType: 'stream' });
                    let name = decodedUrl.split('/').pop() || `file-${(0, uuid_1.v4)()}`;
                    name = name.replace(/\.(heic|mov)$/i, '.jpg');
                    archive.append(response.data, { name });
                }
                catch (err) {
                    console.error(`Failed to append ${fileUrl}:`, err.message);
                }
            }
            await archive.finalize();
        }
        catch (err) {
            reject(err);
        }
    });
}
//# sourceMappingURL=zip-worker.js.map