import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CacheRefreshedEvent, SearchPerformedEvent } from '../events/game.events';

/**
 * Listener for handling game-related events.
 */
@Injectable()
export class GameListener {
  private readonly logger = new Logger(GameListener.name);

  /**
   * Handles the `cache.refreshed` event.
   * Triggered when the games cache is refreshed.
   *
   * @param {CacheRefreshedEvent} event - The event payload containing the number of games in the refreshed cache.
   */
  @OnEvent('cache.refreshed')
  handleCacheRefreshedEvent(event: CacheRefreshedEvent) {
    this.logger.log(`Cache refreshed with ${event.count} games.`);
    // Additional logic: Notify monitoring systems or admins
  }

  /**
   * Handles the `game.search` event.
   * Triggered when a search is performed.
   *
   * @param {SearchPerformedEvent} event - The event payload containing details about the search performed.
   * @property {string} event.query - The search query performed by the user.
   * @property {number} event.resultCount - The number of results returned for the query.
   * @property {number} event.page - The page number of the search results.
   * @property {number} event.limit - The limit of results per page.
   */
  @OnEvent('game.search')
  handleSearchPerformedEvent(event: SearchPerformedEvent) {
    this.logger.log(
      `Search performed: query="${event.query}", results=${event.resultCount}, page=${event.page}, limit=${event.limit}`,
    );
    // Additional logic: Store search analytics in a database
  }
}
