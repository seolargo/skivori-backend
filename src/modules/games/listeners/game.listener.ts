import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CacheRefreshedEvent, SearchPerformedEvent } from '../events/game.events';

@Injectable()
export class GameListener {
  private readonly logger = new Logger(GameListener.name);

  @OnEvent('cache.refreshed')
  handleCacheRefreshedEvent(event: CacheRefreshedEvent) {
    this.logger.log(`Cache refreshed with ${event.count} games.`);
    // Additional logic: Notify monitoring systems or admins
  }

  @OnEvent('game.search')
  handleSearchPerformedEvent(event: SearchPerformedEvent) {
    this.logger.log(
      `Search performed: query="${event.query}", results=${event.resultCount}, page=${event.page}, limit=${event.limit}`,
    );
    // Additional logic: Store search analytics in a database
  }
}
