import { Injectable, NestMiddleware } from '@nestjs/common';
import { Cache } from 'cache-manager';

/**
 * Middleware to implement caching for HTTP requests.
 *
 * The `CachingMiddleware` intercepts incoming requests and checks for cached responses
 * in the cache manager. If a cached response is found, it is returned directly.
 * Otherwise, the middleware captures the response, caches it, and forwards it to the client.
 *
 * @example
 * ```typescript
 * import { MiddlewareConsumer, Module } from '@nestjs/common';
 * import { CachingMiddleware } from './caching.middleware';
 *
 * @Module({
 *   providers: [CachingMiddleware],
 * })
 * export class AppModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer.apply(CachingMiddleware).forRoutes('*');
 *   }
 * }
 * ```
 */
@Injectable()
export class CachingMiddleware implements NestMiddleware {
  /**
   * Initializes the middleware with the cache manager.
   *
   * @param {Cache} cacheManager - The cache manager instance for storing and retrieving cached data.
   */
  constructor(private readonly cacheManager: Cache) {}

  /**
   * Middleware function to handle caching for incoming HTTP requests.
   *
   * @param {any} req - The incoming HTTP request object.
   * @param {any} res - The HTTP response object.
   * @param {() => void} next - The callback to pass control to the next middleware or route handler.
   */
  async use(req: any, res: any, next: () => void) {
    // Unique key for caching based on method and URL
    const key = `${req.method}:${req.url}`; 

    // Check if response is cached
    const cachedResponse = await this.cacheManager.get(key); 

    if (cachedResponse) {
      // If cached response exists, return it
      res.status(200).json(cachedResponse);
      return;
    }

    // Override the response's send method to cache the response body
    const originalSend = res.send.bind(res);
    res.send = async (body: any) => {
      // Cache the response body for 60 seconds
      await this.cacheManager.set(key, body, 60); 

      // Send the response to the client
      originalSend(body); 
    };

    // Proceed to the next middleware or route handler
    next(); 
  }
}
