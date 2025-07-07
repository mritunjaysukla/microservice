# Optimized Zip Microservice

## Overview
This optimized zip service provides a single API endpoint to create and download zip files, leveraging worker threads for performance and streaming files directly to the client without intermediate storage or job tracking. It is fully integrated with AWS S3 (using AWS SDK v3) and supports efficient memory usage for large files.

## Features
- 🚀 **Single Endpoint**: One API call to create and download zip files
- ⚡ **Worker Threads**: Background processing for better performance
- 📡 **Direct Streaming**: No temporary storage, streams directly to client
- 🔄 **Automatic Retry**: Built-in retry mechanism for failed downloads
- 🔧 **File Type Conversion**: Automatic HEIC→JPG, MOV→MP4 conversion
- 🎯 **Memory Optimized**: Efficient streaming for large files
- ☁️ **AWS S3 v3**: Uses AWS SDK for JavaScript (v3) for all S3 operations

## API Usage

### Create and Download Zip
```http
POST /zip
Content-Type: application/json

{
  "fileUrls": [
    "https://cdn.fotosfolio.com/fotosfolioUser_xxx/yyy/zzz/photo1.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&...",
    "https://cdn.fotosfolio.com/fotosfolioUser_xxx/yyy/zzz/photo2.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&..."
  ],
  "zipFileName": "my-archive.zip"
}
```

**Response**: ZIP file streams directly to browser for download.

### Health Check
```http
GET /zip/health
```

### Service Info
```http
GET /zip/info
```

## Example Usage

### JavaScript/Node.js
```javascript
const response = await fetch('/zip', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fileUrls: [
      'https://cdn.fotosfolio.com/fotosfolioUser_xxx/yyy/zzz/photo1.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&...',
      'https://cdn.fotosfolio.com/fotosfolioUser_xxx/yyy/zzz/photo2.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&...'
    ],
    zipFileName: 'my-photos.zip'
  })
});

// Response will be a ZIP file stream
const blob = await response.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'my-photos.zip';
a.click();
```

### cURL
```bash
curl -X POST http://localhost:3000/zip \
  -H "Content-Type: application/json" \
  -d '{
    "fileUrls": [
      "https://cdn.fotosfolio.com/fotosfolioUser_xxx/yyy/zzz/photo1.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&...",
      "https://cdn.fotosfolio.com/fotosfolioUser_xxx/yyy/zzz/photo2.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&..."
    ],
    "zipFileName": "my-photos.zip"
  }' \
  --output my-photos.zip
```

## Configuration

### Environment Variables
```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# S3 Configuration (for source files)
S3_REGION=ap-south-1
S3_ENDPOINT=https://s3.ap-south-1.amazonaws.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name

# Worker Thread Configuration
ZIP_MAX_THREADS=4    # Maximum worker threads
ZIP_MIN_THREADS=2    # Minimum worker threads
```

## Performance Benefits

| Feature | Original Service | Optimized Service |
|---------|------------------|-------------------|
| **Processing** | Single-threaded | Multi-threaded with workers |
| **Memory Usage** | High for large files | Optimized streaming |
| **Response Time** | Immediate start | Immediate start |
| **File Size Limit** | Memory-dependent | Unlimited (streaming) |
| **Concurrency** | Limited | High with worker pool |
| **Error Recovery** | Basic | Advanced retry mechanism |

## Worker Thread Optimizations

- **Streaming Mode**: Smaller batches and faster compression for immediate response
- **Parallel Downloads**: Multiple files downloaded concurrently
- **Smart Retry**: Exponential backoff with configurable retry limits
- **Memory Efficient**: Streams directly from source to archive
- **File Conversion**: Automatic extension normalization (HEIC→JPG, MOV→MP4)

## Architecture

```
Client Request → Controller → Service → Worker Thread Pool → Direct Stream Response
                                    ↓
                               Background Processing:
                               - Download files in parallel (from S3 or CDN)
                               - Create ZIP archive
                               - Stream to client
```

## Comparison with Previous Implementation

### Before (Complex Job-based Approach)
1. Client sends request → Get job ID
2. Poll status endpoint → Wait for completion
3. Get presigned URL → Download from S3

### After (Optimized Single Endpoint)
1. Client sends request → ZIP streams directly
2. No polling needed
3. No S3 storage required
4. Immediate download start

This optimized approach gives you the best of both worlds: the simplicity of your original implementation with the performance benefits of worker threads and AWS S3 v3