import { Injectable, NestMiddleware } from '@nestjs/common';
import sanitizer from 'sanitizer';

/**
 * Middleware for sanitizing request data.
 *
 * This middleware sanitizes input data in the request body and query parameters
 * to prevent injection attacks, such as cross-site scripting (XSS).
 */
@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  /**
   * Middleware handler to sanitize request data.
   *
   * @param req - The incoming HTTP request object.
   * @param res - The outgoing HTTP response object.
   * @param next - The callback function to pass control to the next middleware or handler.
   */
  use(req: any, res: any, next: () => void) {
    // Sanitize the request body
    Object.keys(req.body || {}).forEach((key) => {
      req.body[key] = sanitizer.sanitize(req.body[key]);
    });

    // Sanitize the query parameters
    Object.keys(req.query || {}).forEach((key) => {
      req.query[key] = sanitizer.sanitize(req.query[key]);
    });

    // Pass control to the next middleware or handler
    next();
  }
}
