#!/bin/bash

# ZIP Microservice Startup Script

echo "🚀 Starting ZIP Microservice..."

# Set environment variables for optimal performance
export UV_THREADPOOL_SIZE=16
export NODE_OPTIONS="--max-old-space-size=4096"

# Default environment variables
export ZIP_CONCURRENCY=${ZIP_CONCURRENCY:-10}
export ZIP_CHUNK_SIZE=${ZIP_CHUNK_SIZE:-50}
export WORKER_POOL_SIZE=${WORKER_POOL_SIZE:-4}
export WORKER_CONCURRENCY=${WORKER_CONCURRENCY:-4}

# Redis configuration
export REDIS_HOST=${REDIS_HOST:-localhost}
export REDIS_PORT=${REDIS_PORT:-6379}

# S3 configuration (ensure these are set)
if [ -z "$S3_ACCESS_KEY" ] || [ -z "$S3_SECRET_KEY" ] || [ -z "$S3_BUCKET_NAME" ]; then
    echo "❌ Error: S3 environment variables are required"
    echo "Please set: S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET_NAME"
    exit 1
fi

# Create temp directory
mkdir -p ./tmp

# Check if Redis is running
redis-cli ping > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Redis is not running. Starting Redis..."
    redis-server --daemonize yes --port $REDIS_PORT
fi

echo "✅ Environment configured:"
echo "   - Thread Pool Size: $UV_THREADPOOL_SIZE"
echo "   - ZIP Concurrency: $ZIP_CONCURRENCY"
echo "   - Worker Pool Size: $WORKER_POOL_SIZE"
echo "   - Redis: $REDIS_HOST:$REDIS_PORT"

# Start the application
if [ "$NODE_ENV" = "production" ]; then
    echo "🏭 Starting in production mode..."
    yarn start:prod
else
    echo "🔧 Starting in development mode..."
    yarn start:dev
fi
