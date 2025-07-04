# Optimized Zip Microservice

## Overview
This optimized zip service combines the simplicity of your original single-endpoint approach with the performance benefits of worker threads. It streams zip files directly to the client without intermediate storage or job tracking.

## Features
- 🚀 **Single Endpoint**: One API call to create and download zip files
- ⚡ **Worker Threads**: Background processing for better performance
- 📡 **Direct Streaming**: No temporary storage, streams directly to client
- 🔄 **Automatic Retry**: Built-in retry mechanism for failed downloads
- 🔧 **File Type Conversion**: Automatic HEIC→JPG, MOV→MP4 conversion
- 🎯 **Memory Optimized**: Efficient streaming for large files

## API Usage

### Create and Download Zip
```http
POST /zip
Content-Type: application/json

{
  "fileUrls": [
    "https://cdn.fotosfolio.com/fotosfolioUser_f301238a-4df1-4047-bae3-7df9e7602a35/_67812103-a6f5-4d15-9c78-a895309735c1/sandesh_75554b06-7c51-4867-962b-e7db11cbe4e2/DSC03213_1749762059613.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=MNU4IM4TB6W2F3N2EX9C%2F20250704%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250704T061719Z&X-Amz-Expires=3600&X-Amz-Signature=fcd2ffd998c8174f821ff2d216710994baad8d8058ecacd22a3d94d456d9db0e&X-Amz-SignedHeaders=host",
    "https://cdn.fotosfolio.com/fotosfolioUser_f301238a-4df1-4047-bae3-7df9e7602a35/_67812103-a6f5-4d15-9c78-a895309735c1/sandesh_75554b06-7c51-4867-962b-e7db11cbe4e2/DSC03213_1749762059613_1750327135333_1750327363417.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=MNU4IM4TB6W2F3N2EX9C%2F20250704%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250704T061719Z&X-Amz-Expires=3600&X-Amz-Signature=024afaccc03a44f2b9ca2616cc86098d745c38214f5026a41ac4137ca0421b71&X-Amz-SignedHeaders=host"
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
      'https://example.com/photo1.jpg',
      'https://example.com/photo2.jpg'
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
      "https://example.com/photo1.jpg",
      "https://example.com/photo2.jpg"
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
S3_REGION=custom-region
S3_ENDPOINT=https://your-s3-endpoint.com
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key

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
                               - Download files in parallel
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

This optimized approach gives you the best of both worlds: the simplicity of your original implementation with the performance benefits of worker threads.