import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  s3: {
    region: process.env.S3_REGION || 'custom-region',
    endpoint: process.env.S3_ENDPOINT,
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    bucket: process.env.S3_BUCKET_NAME,
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  },
  zip: {
    smallFileSizeThreshold: parseInt(process.env.ZIP_SMALL_FILE_THRESHOLD || '104857600'), // 100MB
    maxTotalSize: parseInt(process.env.ZIP_MAX_TOTAL_SIZE || '5368709120'), // 5GB
    maxConcurrentDownloads: parseInt(process.env.ZIP_MAX_CONCURRENT_DOWNLOADS || '5'),
    minWorkerThreads: parseInt(process.env.ZIP_MIN_THREADS || '2'),
    maxWorkerThreads: parseInt(process.env.ZIP_MAX_THREADS || '4'),
    chunkSize: parseInt(process.env.ZIP_CHUNK_SIZE || '104857600'), // 100MB per chunk
    cacheExpiry: parseInt(process.env.ZIP_CACHE_EXPIRY || '3600'), // 1 hour
    tempDir: process.env.ZIP_TEMP_DIR || './tmp',
  },
}));
