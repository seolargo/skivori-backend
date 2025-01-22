import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    RequestTimeoutException,
  } from '@nestjs/common';
  import { Observable, throwError, TimeoutError } from 'rxjs';
  import { catchError, timeout } from 'rxjs/operators';
  
  @Injectable()
  export class TimeoutInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
      return next.handle().pipe(
        timeout(5000), // Timeout after 5 seconds
        catchError((err) =>
          throwError(
            () => new RequestTimeoutException('Request timed out'),
          ),
        ),
      );
    }
  }
  