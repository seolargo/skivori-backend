import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor for logging HTTP requests and their response times.
 *
 * The `LoggingInterceptor` logs the method, URL, and time taken for each request
 * to assist with performance monitoring and debugging.
 *
 * @example
 * ```typescript
 * import { Controller, Get, UseInterceptors } from '@nestjs/common';
 * import { LoggingInterceptor } from './logging.interceptor';
 *
 * @Controller('example')
 * @UseInterceptors(LoggingInterceptor)
 * export class ExampleController {
 *   @Get()
 *   getExample() {
 *     return { message: 'This is an example' };
 *   }
 * }
 * ```
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  /**
   * Intercepts requests to log their method, URL, and response time.
   *
   * @param {ExecutionContext} context - Provides details about the current request execution context.
   * @param {CallHandler} next - Handles the next step in the request processing pipeline.
   * @returns {Observable<any>} - An observable of the response.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method; // HTTP method (e.g., GET, POST, etc.)
    const url = request.url; // Request URL
    const now = Date.now(); // Start time for response timing

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now; // Calculate response time
        this.logger.log(`${method} ${url} - ${responseTime}ms`); // Log the method, URL, and response time
      }),
    );
  }
}
