import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import * as path from 'path';
import NodeCache from 'node-cache';

@Injectable()
export class GamesService implements OnModuleInit {
  private readonly logger = new Logger(GamesService.name);
  private readonly gamesFilePath = path.join(__dirname, '../../../mocks/game-data.json');
  private cachedGames: any[] = [];

  // Cache with 5-minute TTL
  private searchCache = new NodeCache({ stdTTL: 300 }); 
  
  // Optimized searchable index
  private gameIndex: Record<string, Set<any>> = {}; 

  constructor(private readonly eventEmitter: EventEmitter2) {
    // Load games at startup
    this.loadGamesFromFile(); 
  }

  /**
   * Loads games data from the specified JSON file.
   * Parses the file content and initializes the cached games and search index.
   * Emits an event when the data is successfully loaded.
   *
   * @private
   */
  private loadGamesFromFile() {
    try {
      const data = fs.readFileSync(this.gamesFilePath, 'utf8');
      this.cachedGames = JSON.parse(data);

      // Build index after loading games
      this.buildGameIndex(); 

      this.logger.log(`Games data loaded successfully. Total games: ${this.cachedGames.length}`);

      this.eventEmitter.emit('cache.refreshed', { count: this.cachedGames.length });
    } catch (error) {
      this.logger.error('Error reading games file:', error);
      this.cachedGames = [];
    }
  }

  /**
   * Builds a search index from the cached games.
   * The index maps each word in the game titles to the corresponding game objects.
   *
   * @private
   */
  private buildGameIndex() {
    this.logger.log('Building optimized search index...');

    // Reset the previous index
    this.gameIndex = {}; 

    for (const game of this.cachedGames) {
      const title = game.title?.toLowerCase();
      if (!title) continue;

      const words = title.split(' ');
      for (const word of words) {
        const normalizedWord = word.trim();

        if (!this.gameIndex[normalizedWord]) {
          this.gameIndex[normalizedWord] = new Set();
        }

        this.gameIndex[normalizedWord].add(game);
      }
    }
    this.logger.log('Search index built successfully.');
  }

  /**
   * Retrieves paginated games based on the provided search query.
   * If the result is cached, it returns the cached value. Otherwise, it performs a search, caches the result, and returns it.
   *
   * @param {string} searchQuery - The search query to filter games.
   * @param {number} page - The current page number for pagination.
   * @param {number} limit - The number of items per page.
   * @returns {{ total: number; page: number; limit: number; paginatedGames: any[] }} - Paginated games and metadata.
   */
  getGames(searchQuery: string, page: number, limit: number): { total: number; page: number; limit: number; paginatedGames: any[] } {
    const cacheKey = `${searchQuery}-${page}-${limit}`;
    const cachedResult = this.searchCache.get(cacheKey);

    if (cachedResult) {
      // Cache hit
      this.logger.log(`Cache hit for query: "${searchQuery}"`);

      return cachedResult as { total: number; page: number; limit: number; paginatedGames: any[] };
    }

    // Cache miss
    const query = (searchQuery || '').toLowerCase().trim();
    let filteredGames: Set<any> = new Set();

    if (query) {
      for (const word of query.split(' ')) {
        if (this.gameIndex[word]) {
          this.gameIndex[word].forEach((game) => filteredGames.add(game));
        }
      }
    } else {
      // If no query, return all games
      filteredGames = new Set(this.cachedGames);
    }

    // Convert the Set to an Array for pagination
    const filteredGamesArray = Array.from(filteredGames);

    // Paginate the results
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedGames = filteredGamesArray.slice(startIndex, endIndex);

    const result = {
      total: filteredGamesArray.length,
      page,
      limit,
      paginatedGames,
    };

    // Cache the result for subsequent requests
    this.searchCache.set(cacheKey, result);

    // Emit an event with the search details
    this.eventEmitter.emit('game.search', {
      query,
      resultCount: filteredGamesArray.length,
      page,
      limit,
    });

    return result;
  }

  /**
   * Called when the module is initialized.
   * Schedules a daily cache refresh.
   */
  onModuleInit() {
    this.startDailyCacheRefresh();
  }

  /**
   * Schedules a daily cache refresh to reload games data and rebuild the index.
   *
   * @private
   */
  private startDailyCacheRefresh() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);

    const timeUntilMidnight = midnight.getTime() - now.getTime();

    setTimeout(() => {
      this.handleDailyCacheRefresh();

      setInterval(() => this.handleDailyCacheRefresh(), 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
  }

  /**
   * Handles the daily cache refresh process.
   * Reloads the games data and rebuilds the search index.
   *
   * @private
   */
  private handleDailyCacheRefresh() {
    this.logger.log('Running daily cache refresh...');

    this.loadGamesFromFile();
    
    this.logger.log('Cache refreshed successfully.');
  }
}