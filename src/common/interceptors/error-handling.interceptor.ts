import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadGatewayException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Interceptor for handling errors during the execution of a request.
 *
 * The `ErrorHandlingInterceptor` catches any errors that occur in the request pipeline,
 * logs them, and transforms them into a consistent error response.
 *
 * @example
 * ```typescript
 * import { Controller, Get, UseInterceptors } from '@nestjs/common';
 * import { ErrorHandlingInterceptor } from './error-handling.interceptor';
 *
 * @Controller('example')
 * @UseInterceptors(ErrorHandlingInterceptor)
 * export class ExampleController {
 *   @Get()
 *   getExample() {
 *     throw new Error('An unexpected error occurred');
 *   }
 * }
 * ```
 */
@Injectable()
export class ErrorHandlingInterceptor implements NestInterceptor {
  /**
   * Intercepts requests to handle errors in the request pipeline.
   *
   * @param {ExecutionContext} context - Provides details about the current request execution context.
   * @param {CallHandler} next - Handles the next step in the request processing pipeline.
   * @returns {Observable<any>} - An observable of the response or an error.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        // Log the error message for debugging
        console.error('Error intercepted: ', err.message);

        // Transform the error into a consistent response
        return throwError(() => new BadGatewayException('Something went wrong'));
      }),
    );
  }
}
