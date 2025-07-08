import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

// Ensure proper error handling to prevent instanceof issues
function ensureError(exception: unknown): Error {
  if (exception instanceof Error) return exception;
  if (exception && typeof exception === 'object' && 'message' in exception && typeof exception.message === 'string') {
    return new Error(exception.message);
  }
  if (typeof exception === 'string') return new Error(exception);
  return new Error(`Unknown error: ${JSON.stringify(exception)}`);
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    try {
      // Handle different types of exceptions
      if (exception instanceof HttpException) {
        status = exception.getStatus();
        const exceptionResponse = exception.getResponse();
        message = typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || exception.message;
      } else {
        // Convert to proper Error object to avoid instanceof issues
        const safeError = ensureError(exception);
        message = safeError.message;
      }

      this.logger.error(
        `${request.method} ${request.url} - ${status} - ${message}`,
        exception instanceof Error ? exception.stack : String(exception),
      );

      // Don't send response if headers are already sent
      if (!response.headersSent) {
        response.status(status).json({
          statusCode: status,
          message,
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }
    } catch (filterError) {
      // Fallback error handling
      this.logger.error('Exception filter error:', filterError);

      if (!response.headersSent) {
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          timestamp: new Date().toISOString(),
          path: request.url,
        });
      }
    }
  }
}
