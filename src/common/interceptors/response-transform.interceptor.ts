import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Interceptor for transforming responses into a standardized structure.
 *
 * The `ResponseTransformInterceptor` ensures that all responses follow a consistent
 * format with a `success` flag and a `data` property. This makes it easier for
 * clients consuming the API to handle responses predictably.
 *
 * @example
 * ```typescript
 * import { Controller, Get, UseInterceptors } from '@nestjs/common';
 * import { ResponseTransformInterceptor } from './response-transform.interceptor';
 *
 * @Controller('example')
 * @UseInterceptors(ResponseTransformInterceptor)
 * export class ExampleController {
 *   @Get()
 *   getExample() {
 *     return { message: 'This is an example' };
 *   }
 * }
 * // Response:
 * // {
 * //   "success": true,
 * //   "data": {
 * //     "message": "This is an example"
 * //   }
 * // }
 * ```
 */
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  /**
   * Intercepts the outgoing response and transforms it into a standardized format.
   *
   * @param {ExecutionContext} context - Provides details about the current request execution context.
   * @param {CallHandler} next - Handles the next step in the request processing pipeline.
   * @returns {Observable<any>} - An observable of the transformed response.
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => ({
        success: true, // Indicates the success of the response
        data, // The original response data wrapped in the `data` property
      })),
    );
  }
}
