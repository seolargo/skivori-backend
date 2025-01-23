import { Injectable, NestMiddleware } from '@nestjs/common';
import rateLimit from 'express-rate-limit';

/**
 * Middleware for implementing rate limiting.
 *
 * This middleware restricts the number of requests that can be made by a single IP address
 * within a specific time window to prevent abuse or overloading of the server.
 */
@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  /**
   * Rate limiter configuration.
   * Limits each IP to 100 requests per minute and sends a custom message when the limit is exceeded.
   */
  private readonly rateLimiter = rateLimit({
    // 1-minute window
    windowMs: 60 * 1000, 
    // Maximum 100 requests per minute per IP
    max: 100, 
    // Custom message for rate limit exceeded
    message: 'Too many requests, please try again later.', 
  });

  /**
   * Applies the rate limiter to incoming requests.
   *
   * @param req - The incoming HTTP request object.
   * @param res - The outgoing HTTP response object.
   * @param next - The callback function to pass control to the next middleware or handler.
   */
  use(req: any, res: any, next: () => void) {
    // Apply the rate limiter to the request.
    this.rateLimiter(req, res, next); 
  }
}
