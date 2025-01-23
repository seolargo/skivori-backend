import { Injectable, NestMiddleware } from '@nestjs/common';

/**
 * Middleware for transforming responses.
 *
 * This middleware wraps the original response and ensures a consistent format for all outgoing responses.
 */
@Injectable()
export class ResponseTransformMiddleware implements NestMiddleware {
  /**
   * Middleware handler to intercept and transform responses.
   *
   * @param req - The incoming HTTP request object.
   * @param res - The outgoing HTTP response object.
   * @param next - The callback function to pass control to the next middleware or handler.
   */
  use(req: any, res: any, next: () => void) {
    // Bind the original `send` method.
    const originalSend = res.send.bind(res); 

    res.send = (body: any) => {
      // Avoid transforming a response that's already transformed
      if (res.locals.isTransformed) {
        return originalSend(body);
      }

      // Mark the response as transformed.
      res.locals.isTransformed = true; 

      // Wrap the response in a consistent format
      const transformedBody = {
        success: true,
        data: body,
      };

      try {
        // Send the transformed response.
        originalSend(transformedBody); 
      } catch (error) {
        console.error('Error transforming response:', error);

        // Fallback to the original response.
        originalSend(body); 
      }
    };

    // Pass control to the next middleware or handler.
    next(); 
  }
}
