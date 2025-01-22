import { Injectable, NestMiddleware } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CachingMiddleware implements NestMiddleware {
  constructor(private readonly cacheManager: Cache) {}

  async use(req: any, res: any, next: () => void) {
    const key = `${req.method}:${req.url}`;
    const cachedResponse = await this.cacheManager.get(key);

    if (cachedResponse) {
      res.status(200).json(cachedResponse);
      return;
    }

    const originalSend = res.send.bind(res);
    res.send = async (body: any) => {
      await this.cacheManager.set(key, body, 60); // Cache for 60 seconds
      originalSend(body);
    };

    next();
  }
}
