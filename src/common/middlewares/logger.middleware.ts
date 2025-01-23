import { Injectable, NestMiddleware } from '@nestjs/common';

/**
 * Middleware for logging incoming HTTP requests.
 *
 * This middleware logs the HTTP method and URL of each request to the console.
 */
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  /**
   * Logs the HTTP method and URL of the incoming request and passes control to the next middleware or handler.
   *
   * @param req - The incoming HTTP request object.
   * @param res - The outgoing HTTP response object.
   * @param next - The callback function to pass control to the next middleware or handler.
   */
  use(req: any, res: any, next: () => void) {
    console.log(`${req.method} ${req.url}`);

    // Pass control to the next middleware or handler.
    next(); 
  }
}
