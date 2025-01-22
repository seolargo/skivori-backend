import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class ErrorHandlingMiddleware implements NestMiddleware {
  use(req: any, res: any, next: (err?: any) => void) {
    res.on('finish', () => {
      if (res.statusCode >= 400) {
        console.error(`Error: ${res.statusCode} - ${req.method} ${req.url}`);
      }
    });

    try {
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: (error as Error).message,
      });
    }
  }
}
