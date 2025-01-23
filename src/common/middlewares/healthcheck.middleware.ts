import { Injectable, NestMiddleware } from '@nestjs/common';

/**
 * Middleware to handle health check requests.
 *
 * This middleware intercepts requests to the `/health` endpoint and returns
 * a JSON response indicating the application's health status. If the request
 * is not for the `/health` endpoint, it passes control to the next middleware
 * or route handler.
 */
@Injectable()
export class HealthCheckMiddleware implements NestMiddleware {
  /**
   * Method to handle health check requests or pass control to the next handler.
   *
   * @param req - The incoming HTTP request object.
   * @param res - The outgoing HTTP response object.
   * @param next - The callback function to pass control to the next middleware or handler.
   */
  use(req: any, res: any, next: () => void) {
    // Check if the request URL matches the `/health` endpoint.
    if (req.url === '/health') {
      // Respond with a 200 status and a JSON object indicating health status.
      res.status(200).json({ success: true, status: 'OK' });

      // End the request-response cycle.
      return; 
    }
    
    // Pass control to the next middleware or handler if the URL is not `/health`.
    next();
  }
}
