import { Injectable, NestMiddleware } from '@nestjs/common';

/**
 * Middleware to set global HTTP headers for security and metadata.
 * 
 * This middleware adds headers to every HTTP response to enhance security
 * and provide metadata. It sets the `X-Powered-By` header to indicate the 
 * framework in use and adds a `Content-Security-Policy` header for improved security.
 */
@Injectable()
export class GlobalHeaderMiddleware implements NestMiddleware {
  /**
   * Method to set global headers on every HTTP response.
   *
   * @param req - The incoming HTTP request object.
   * @param res - The outgoing HTTP response object.
   * @param next - The callback function to pass control to the next middleware.
   */
  use(req: any, res: any, next: () => void) {
    // Set a custom header to indicate the framework used.
    res.setHeader('X-Powered-By', 'NestJS');

    // Set a Content Security Policy header to restrict resource loading.
    res.setHeader('Content-Security-Policy', "default-src 'self'");

    // Pass control to the next middleware or handler.
    next();
  }
}
