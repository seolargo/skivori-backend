import { Injectable, NestMiddleware } from '@nestjs/common';

/**
 * Middleware for error handling and logging HTTP responses with status codes >= 400.
 * 
 * This middleware listens to the `finish` event of the response object and logs
 * any errors (status codes 400 and above). It also catches synchronous errors
 * and returns a 500 Internal Server Error response if an exception is thrown.
 */
@Injectable()
export class ErrorHandlingMiddleware implements NestMiddleware {
  /**
   * Method to handle incoming requests and process errors.
   *
   * @param req - The incoming HTTP request object.
   * @param res - The outgoing HTTP response object.
   * @param next - The callback function to pass control to the next middleware.
   */
  use(req: any, res: any, next: (err?: any) => void) {
    // Listen for the 'finish' event to log errors for status codes >= 400.
    res.on('finish', () => {
      if (res.statusCode >= 400) {
        console.error(`Error: ${res.statusCode} - ${req.method} ${req.url}`);
      }
    });

    try {
      // Pass control to the next middleware or handler.
      next();
    } catch (error) {
      // Catch any synchronous errors and return a 500 Internal Server Error response.
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: (error as Error).message,
      });
    }
  }
}
