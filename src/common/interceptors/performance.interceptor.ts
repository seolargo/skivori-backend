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
 * Interceptor for measuring and logging the performance of request processing.
 *
 * The `PerformanceInterceptor` logs the execution time for processing each request.
 * It is useful for identifying bottlenecks and monitoring overall application performance.
 *
 * @example
 * ```typescript
 * import { Controller, Get, UseInterceptors } from '@nestjs/common';
 * import { PerformanceInterceptor } from './performance.interceptor';
 *
 * @Controller('example')
 * @UseInterceptors(PerformanceInterceptor)
 * export class ExampleController {
 *   @Get()
 *   getExample() {
 *     return { message: 'This is an example' };
 *   }
 * }
 * ```
 */
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);

  /**
   * Intercepts requests to log their execution time.
   *
   * @param {ExecutionContext} context - Provides details about the current request execution context.
   * @param {CallHandler} next - Handles the next step in the request processing pipeline.
   * @returns {Observable<any>} - An observable of the response.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now(); // Start time for request processing
    return next.handle().pipe(
      tap(() => {
        // Calculate elapsed time
        const elapsed = Date.now() - now; 
        // Log the execution time
        this.logger.log(`Execution time: ${elapsed}ms`); 
      }),
    );
  }
}
