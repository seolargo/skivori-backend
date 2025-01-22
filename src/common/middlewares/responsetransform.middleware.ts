import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class ResponseTransformMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const originalSend = res.send.bind(res);

    res.send = (body: any) => {
      // Avoid transforming an already transformed response
      if (res.locals.isTransformed) {
        return originalSend(body);
      }

      res.locals.isTransformed = true; // Mark response as transformed

      // Transform the response
      const transformedBody = {
        success: true,
        data: body,
      };

      try {
        originalSend(transformedBody);
      } catch (error) {
        console.error('Error transforming response:', error);
        originalSend(body); // Fallback to original response
      }
    };

    next();
  }
}
