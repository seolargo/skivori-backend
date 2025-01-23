import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

/**
 * Interceptor to enforce a request timeout for API requests.
 *
 * The `TimeoutInterceptor` ensures that any request taking longer than the specified
 * duration (default: 5 seconds) will throw a `RequestTimeoutException`. This helps
 * prevent unresponsive APIs and improves the user experience.
 *
 * @example
 * ```typescript
 * import { Controller, Get, UseInterceptors } from '@nestjs/common';
 * import { TimeoutInterceptor } from './timeout.interceptor';
 *
 * @Controller('example')
 * @UseInterceptors(TimeoutInterceptor)
 * export class ExampleController {
 *   @Get()
 *   getExample() {
 *     return new Promise((resolve) => setTimeout(() => resolve('Done'), 6000));
 *   }
 * }
 * // Response:
 * // {
 * //   "statusCode": 408,
 * //   "message": "Request timed out"
 * // }
 * ```
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  /**
   * Intercepts incoming requests and applies a timeout for response handling.
   *
   * @param {ExecutionContext} context - Provides details about the current request execution context.
   * @param {CallHandler} next - Handles the next step in the request processing pipeline.
   * @returns {Observable<any>} - An observable that emits the response or throws a timeout exception.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      // Timeout after 5 seconds
      timeout(5000), 
      catchError((err) => {
        if (err instanceof TimeoutError) {
          // Log or handle specific timeout logic if necessary
          return throwError(() => new RequestTimeoutException('Request timed out'));
        }
        return throwError(() => err); // Propagate other errors
      }),
    );
  }
}
