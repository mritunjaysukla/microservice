# ZIP Microservice Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Technology Stack](#technology-stack)
5. [File Descriptions](#file-descriptions)
6. [Application Flow](#application-flow)
7. [Configuration](#configuration)
8. [API Endpoints](#api-endpoints)
9. [Features](#features)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Performance Characteristics](#performance-characteristics)

---

## Overview

This ZIP Microservice is a comprehensive Node.js/NestJS application that provides efficient file compression and archiving capabilities. It processes files from S3 storage or URLs and creates downloadable ZIP archives with intelligent processing strategies based on file sizes and system load.

### Key Capabilities
- **Intelligent Processing**: Automatically chooses between streaming and queue-based processing
- **S3 Integration**: Seamless AWS S3 integration with SDK v3
- **Redis Caching**: Metadata and result caching for performance
- **Worker Threads**: Background processing for CPU-intensive tasks
- **Queue Management**: BullMQ for handling large file processing
- **Real-time Status**: Job progress tracking and status monitoring

---

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │───▶│  ZIP Controller │───▶│ Enhanced Service│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Queue Service  │    │  Datahub Service│
                       └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Worker Threads │    │   S3 Client     │
                       └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Redis Cache    │    │   File System   │
                       └─────────────────┘    └─────────────────┘
```

---

## Project Structure

```
src/
├── app.module.ts                          # Main application module
├── main.ts                               # Application entry point
├── config/
│   └── app.config.ts                     # Application configuration
└── zip/
    ├── zip.module.ts                     # ZIP module configuration
    ├── zip.controller.ts                 # REST API endpoints
    ├── enhanced-zip.service.ts           # Core ZIP processing service
    ├── zip-cleanup.cron.ts              # Scheduled cleanup tasks
    ├── dto/
    │   └── zip-request.dto.ts           # Request validation DTOs
    ├── datahub/
    │   ├── datahub.module.ts            # Datahub module
    │   └── datahub.service.ts           # S3 operations service
    ├── queue/
    │   └── zip-queue.service.ts         # BullMQ queue management
    ├── workers/
    │   └── enhanced-zip-worker.ts       # Worker thread implementation
    └── utils/
        └── temp-file-cleaner.ts         # Utility functions

test/
├── zip.controller.spec.ts               # Controller unit tests
└── zip.e2e-spec.ts                     # End-to-end tests
```

---

## Technology Stack

- **Framework**: NestJS (Node.js framework)
- **Language**: TypeScript
- **Database/Cache**: Redis (for caching and queue)
- **Queue**: BullMQ (for background job processing)
- **Cloud Storage**: AWS S3 (with SDK v3)
- **Compression**: Archiver (ZIP creation)
- **Worker Threads**: Node.js Worker Threads
- **HTTP Client**: Fetch API
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

---

## File Descriptions

### 1. `src/main.ts`
**Purpose**: Application bootstrap and configuration
- Initializes NestJS application
- Configures global pipes and filters
- Sets up Swagger documentation
- Handles global error handling
- Configures body parser limits (50MB)

### 2. `src/app.module.ts`
**Purpose**: Root application module
- Imports all feature modules
- Configures Redis cache manager
- Sets up configuration management
- Enables scheduled tasks
- Registers global providers

### 3. `src/zip/zip.controller.ts`
**Purpose**: REST API controller for ZIP operations
- **POST `/zip`**: Creates ZIP archive from file URLs
- **GET `/zip/download/:jobId`**: Downloads completed ZIP files
- **GET `/zip/status/:jobId`**: Checks job processing status
- Handles request validation and error responses
- Integrates with both streaming and queue-based processing

### 4. `src/zip/enhanced-zip.service.ts`
**Purpose**: Core business logic for ZIP processing
- **Smart Processing Strategy**: Chooses between streaming vs. queue based on file size
- **Metadata Fetching**: Retrieves file information from URLs
- **Cache Management**: Redis-based caching for performance
- **Small File Processing**: Direct streaming for files < 200MB
- **Large File Processing**: Queue-based processing for files > 200MB
- **Error Handling**: Comprehensive error management and logging

### 5. `src/zip/queue/zip-queue.service.ts`
**Purpose**: Background job processing with BullMQ
- **Job Queue Management**: Adds and processes ZIP creation jobs
- **Worker Configuration**: Configures Redis-based workers
- **Progress Tracking**: Real-time job progress updates
- **File Processing**: Downloads and compresses files in background
- **Status Management**: Tracks job states and results

### 6. `src/zip/workers/enhanced-zip-worker.ts`
**Purpose**: Worker thread for CPU-intensive ZIP operations
- **Parallel Processing**: Handles multiple file downloads concurrently
- **S3 Integration**: Direct S3 object streaming
- **Error Handling**: Retry logic with exponential backoff
- **Progress Reporting**: Real-time progress updates to main thread
- **Memory Optimization**: Efficient streaming without memory buildup

### 7. `src/zip/datahub/datahub.service.ts`
**Purpose**: S3 operations and file management
- **S3 Client Management**: Optimized S3 client with connection pooling
- **File Operations**: Upload, download, delete, and list operations
- **Presigned URLs**: Generate secure access URLs
- **Bucket Management**: Comprehensive bucket operations
- **Caching**: Redis-based result caching

### 8. `src/zip/dto/zip-request.dto.ts`
**Purpose**: Request validation and data transfer
- **Input Validation**: Validates file URLs and ZIP filename
- **Type Safety**: Ensures proper data types
- **Error Messages**: Provides clear validation error messages

---

## Application Flow

### 1. ZIP Creation Flow (Small Files < 200MB)
```
1. Client Request → Controller validates input
2. Enhanced Service → Fetches file metadata
3. Cache Check → Retrieves cached metadata if available
4. Direct Streaming → Archives files directly to response
5. Client Download → ZIP streams directly to client
```

### 2. ZIP Creation Flow (Large Files > 200MB)
```
1. Client Request → Controller validates input
2. Enhanced Service → Determines large file processing needed
3. Queue Service → Adds job to BullMQ queue
4. Worker Thread → Processes files in background
5. Redis Storage → Stores completed ZIP metadata
6. Client Polling → Checks status via /status endpoint
7. Download → Client downloads via /download endpoint
```

### 3. File Metadata Processing
```
1. URL Processing → Extracts file information from URLs
2. Parallel Fetching → Concurrent HEAD requests for metadata
3. Cache Storage → Stores metadata in Redis (1 hour TTL)
4. Size Calculation → Determines total archive size
5. Strategy Selection → Chooses processing approach
```

### 4. Worker Thread Processing
```
1. Job Reception → Worker receives file list and configuration
2. S3 Setup → Initializes S3 client with credentials
3. Parallel Downloads → Downloads files concurrently (limit: 10)
4. Stream Processing → Converts S3 streams to Node.js streams
5. Archive Creation → Adds files to ZIP archive
6. Progress Updates → Reports progress to main thread
7. Completion → Signals success/failure to queue
```

---

## Configuration

### Environment Variables
```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# S3 Configuration
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name
S3_REGION=ap-south-1

# Performance Settings
ZIP_CONCURRENCY=10
ZIP_CHUNK_SIZE=50
WORKER_POOL_SIZE=4
ZIP_WORKER_CONCURRENCY=2
```

### Application Configuration (`src/config/app.config.ts`)
```typescript
export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  s3: {
    region: process.env.S3_REGION || 'ap-south-1',
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    bucketName: process.env.S3_BUCKET_NAME,
  },
});
```

---

## API Endpoints

### 1. Create ZIP Archive
```http
POST /zip
Content-Type: application/json

{
  "fileUrls": [
    "https://cdn.example.com/file1.jpg",
    "https://cdn.example.com/file2.pdf"
  ],
  "zipFileName": "my-archive.zip"
}
```

**Response (Small Files - Direct Stream)**:
- Content-Type: `application/zip`
- ZIP file streams directly to client

**Response (Large Files - Queue Processing)**:
```json
{
  "message": "Zip processing started",
  "jobId": "zip-abc123",
  "statusUrl": "/zip/status/zip-abc123",
  "downloadUrl": "/zip/download/zip-abc123",
  "totalFiles": 100,
  "totalSize": 1073741824,
  "estimatedTime": "Ready in 2-5 minutes"
}
```

### 2. Check Job Status
```http
GET /zip/status/:jobId
```

**Response**:
```json
{
  "status": "completed",
  "downloadUrl": "/zip/download/zip-abc123",
  "fileName": "my-archive.zip",
  "size": 1073741824,
  "createdAt": "2024-01-01T10:00:00Z"
}
```

### 3. Download ZIP File
```http
GET /zip/download/:jobId
```

**Response**:
- Content-Type: `application/zip`
- ZIP file stream

---

## Features

### 1. **Intelligent Processing Strategy**
- **Small Files (< 200MB)**: Direct streaming for immediate download
- **Large Files (> 200MB)**: Background processing with job tracking
- **Automatic Detection**: Based on total file size calculation

### 2. **Performance Optimizations**
- **Redis Caching**: Metadata and result caching
- **Parallel Processing**: Concurrent file downloads
- **Worker Threads**: CPU-intensive tasks in separate threads
- **Connection Pooling**: Optimized S3 client connections
- **Streaming**: Memory-efficient file processing

### 3. **Error Handling**
- **Retry Logic**: Automatic retry for failed downloads
- **Graceful Degradation**: Fallback strategies for failures
- **Comprehensive Logging**: Detailed error tracking
- **Proper Error Objects**: All errors converted to Error instances

### 4. **Monitoring & Cleanup**
- **Scheduled Cleanup**: Automatic temporary file removal
- **Progress Tracking**: Real-time job progress updates
- **Health Checks**: Service health monitoring
- **Structured Logging**: Comprehensive logging with job IDs

---

## Testing

### Unit Tests (`test/zip.controller.spec.ts`)
- Controller method testing
- Service integration testing
- Mock implementations for dependencies

### E2E Tests (`test/zip.e2e-spec.ts`)
- Full application flow testing
- API endpoint validation
- Error scenario testing

### Test Commands
```bash
# Run unit tests
yarn test

# Run E2E tests
yarn run test:e2e

# Run tests with coverage
yarn run test:cov
```

---

## Deployment

### Development
```bash
# Install dependencies
yarn install

# Start Redis server
redis-server

# Start application
yarn run start:dev
```

### Production
```bash
# Build application
yarn build

# Start production server
yarn run start:prod
```



## Performance Characteristics

### Small Files (< 200MB)
- **Processing**: Direct streaming
- **Memory Usage**: Minimal (< 100MB)
- **Response Time**: Immediate
- **Throughput**: ~10-20 files/second

### Large Files (> 200MB)
- **Processing**: Background queue
- **Memory Usage**: Optimized with streaming
- **Response Time**: 2-5 minutes
- **Throughput**: Depends on file sizes and worker count

### Caching Performance
- **Metadata Cache**: 1-hour TTL
- **Result Cache**: 24-hour TTL
- **Cache Hit Rate**: ~80-90% for repeated requests

---

## Error Handling

### Common Error Scenarios
1. **Invalid File URLs**: Returns 400 Bad Request
2. **File Download Failures**: Automatic retry with exponential backoff
3. **S3 Connection Issues**: Graceful degradation with fallback
4. **Redis Connection Loss**: Continues processing without caching
5. **Memory Limitations**: Switches to queue-based processing

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Invalid file URL format",
  "error": "Bad Request",
  "timestamp": "2024-01-01T10:00:00Z"
}
```

---

## Security Considerations

### Input Validation
- URL format validation
- File size limits
- Content type checking
- Rate limiting (configurable)

### Data Protection
- No sensitive data logging
- Temporary file cleanup
- Secure S3 access patterns
- Redis connection security

---

## Monitoring and Logging

### Logging Features
- Structured JSON logging
- Job ID tracking
- Performance metrics
- Error stack traces
- Request/response logging

### Health Checks
- Redis connectivity
- S3 bucket access
- Worker thread health
- Memory usage monitoring

---

## Future Enhancements

### Planned Features
1. **Authentication**: JWT/OAuth integration
2. **File Encryption**: Password-protected ZIP files
3. **Webhook Support**: Completion notifications
4. **Metrics Dashboard**: Real-time monitoring
5. **Multi-region Support**: Global file processing
6. **Advanced Caching**: Intelligent cache strategies

### Technical Improvements
- Horizontal scaling support
- Database persistence option
- Advanced retry mechanisms
- Custom compression algorithms
- Performance analytics

---

## Troubleshooting

### Common Issues

**1. Redis Connection Issues**
```bash
# Check Redis status
redis-cli ping

# Restart Redis
sudo systemctl restart redis
```

**2. S3 Access Problems**
```bash
# Verify S3 credentials
aws s3 ls s3://your-bucket-name
```

**3. Memory Issues**
```bash
# Check Node.js memory usage
node --max-old-space-size=8192 dist/main
```

**4. Queue Processing Stuck**
```bash
# Clear Redis queue
redis-cli FLUSHDB
```

### Debug Configuration
```typescript
// Enable debug logging
process.env.LOG_LEVEL = 'debug';

// Monitor queue status
GET /zip/queue/status

// Check worker health
GET /zip/workers/health
```

---

## API Testing Examples

### Using cURL

**Create ZIP (Small Files)**:
```bash
curl -X POST http://localhost:3000/zip \
  -H "Content-Type: application/json" \
  -d '{
    "fileUrls": ["https://example.com/file1.jpg"],
    "zipFileName": "test.zip"
  }' \
  --output test.zip
```

**Create ZIP (Large Files)**:
```bash
curl -X POST http://localhost:3000/zip \
  -H "Content-Type: application/json" \
  -d '{
    "fileUrls": ["https://example.com/largefile.mp4"],
    "zipFileName": "large.zip"
  }'
```

**Check Status**:
```bash
curl -X GET http://localhost:3000/zip/status/zip-abc123
```

**Download ZIP**:
```bash
curl -X GET http://localhost:3000/zip/download/zip-abc123 \
  --output downloaded.zip
```

---

## Performance Tuning

### Configuration Options
```typescript
// Worker thread settings
WORKER_POOL_SIZE=4
ZIP_WORKER_CONCURRENCY=2

// Download settings
ZIP_CONCURRENCY=10
ZIP_CHUNK_SIZE=50

// Redis settings
REDIS_MAX_CONNECTIONS=10
REDIS_RETRY_DELAY=100

// S3 settings
S3_MAX_CONNECTIONS=50
S3_TIMEOUT=30000
```

### Memory Optimization
- Use streaming for large files
- Implement garbage collection hints
- Monitor memory usage patterns
- Configure appropriate heap sizes

---

**Document Version**: 1.0  
**Last Updated**: January 9, 2025  
**Technology**: NestJS, TypeScript, Redis, AWS S3, BullMQ  
**Status**: Production Ready  
**Author**: Development Team  
**Contact**: [Your Contact Information]

---

## Appendix

### Dependencies
```json
{
  "@nestjs/common": "^10.0.0",
  "@nestjs/core": "^10.0.0",
  "@nestjs/platform-express": "^10.0.0",
  "@nestjs/cache-manager": "^2.0.0",
  "@nestjs/schedule": "^4.0.0",
  "@nestjs/swagger": "^7.0.0",
  "@aws-sdk/client-s3": "^3.0.0",
  "bullmq": "^4.0.0",
  "redis": "^4.0.0",
  "archiver": "^6.0.0",
  "class-validator": "^0.14.0",
  "class-transformer": "^0.5.0"
}
```

### License
This project is licensed under the MIT License.

### Support
For technical support and questions, please contact the development team or create an issue in the project repository.
