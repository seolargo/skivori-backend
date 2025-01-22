import { Injectable, NestMiddleware } from '@nestjs/common';
import sanitizer from 'sanitizer';

@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    Object.keys(req.body || {}).forEach((key) => {
      req.body[key] = sanitizer.sanitize(req.body[key]);
    });
    
    Object.keys(req.query || {}).forEach((key) => {
      req.query[key] = sanitizer.sanitize(req.query[key]);
    });

    next();
  }
}
