import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class GlobalHeaderMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    res.setHeader('X-Powered-By', 'NestJS');
    res.setHeader('Content-Security-Policy', "default-src 'self'");
    next();
  }
}
