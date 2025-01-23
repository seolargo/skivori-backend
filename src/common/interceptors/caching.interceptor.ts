import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cache } from 'cache-manager';

/**
 * Interceptor for caching HTTP responses.
 *
 * The `CachingInterceptor` checks if the response for a specific HTTP request is already cached.
 * If a cached response is found, it returns the cached data without executing the route handler.
 * Otherwise, it processes the request, caches the response, and returns it to the client.
 *
 * @example
 * ```typescript
 * import { Controller, Get, UseInterceptors } from '@nestjs/common';
 * import { CachingInterceptor } from './caching.interceptor';
 *
 * @Controller('games')
 * @UseInterceptors(CachingInterceptor)
 * export class GamesController {
 *   @Get()
 *   getGames() {
 *     return { data: 'Some games data' };
 *   }
 * }
 * ```
 */
@Injectable()
export class CachingInterceptor implements NestInterceptor {
  /**
   * Creates an instance of `CachingInterceptor`.
   *
   * @param {Cache} cacheManager - The cache manager instance used for storing and retrieving cached data.
   */
  constructor(@Inject('CACHE_MANAGER') private readonly cacheManager: Cache) {}

  /**
   * Intercepts HTTP requests to implement caching.
   *
   * @param {ExecutionContext} context - Provides details about the current request execution context.
   * @param {CallHandler} next - Handles the next step in the request processing pipeline.
   * @returns {Promise<Observable<any>>} - An observable of the response, either from cache or the route handler.
   */
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    // Generate a cache key based on the HTTP method and URL
    const key = `${request.method}-${request.url}`; 

    // Check if the response is already cached
    const cachedResponse = await this.cacheManager.get(key);
    if (cachedResponse) {
      // Return the cached response
      return of(cachedResponse); 
    }

    // Process the request and cache the response
    return next.handle().pipe(
      tap(async (response) => {
        // Cache the response for 60 seconds
        await this.cacheManager.set(key, response, 60); 
      }),
    );
  }
}
