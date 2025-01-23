import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response, Request } from 'express';

/**
 * An HTTP-specific exception filter that captures `HttpException` instances.
 * 
 * This filter handles HTTP exceptions by sending a structured error response to the client,
 * including details such as the status code, error message, timestamp, and request path.
 * 
 * @example
 * ```typescript
 * import { Module } from '@nestjs/common';
 * import { APP_FILTER } from '@nestjs/core';
 * import { HttpErrorFilter } from './http-error.filter';
 * 
 * @Module({
 *   providers: [
 *     {
 *       provide: APP_FILTER,
 *       useClass: HttpErrorFilter,
 *     },
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  /**
   * Handles `HttpException` and sends a structured JSON response to the client.
   * 
   * @param {HttpException} exception - The exception object containing details about the error.
   * @param {ArgumentsHost} host - Provides access to the HTTP context, including the request and response objects.
   */
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    // Send a structured error response to the client
    response.status(status).json({
      success: false, // Indicates the failure of the request
      statusCode: status, // HTTP status code
      message: exception.message, // Error message
      timestamp: new Date().toISOString(), // Timestamp of the error
      path: request.url, // The URL path where the error occurred
    });
  }
}
