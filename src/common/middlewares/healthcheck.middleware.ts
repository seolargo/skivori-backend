import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class HealthCheckMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    if (req.url === '/health') {
      res.status(200).json({ success: true, status: 'OK' });
      return;
    }
    
    next();
  }
}
