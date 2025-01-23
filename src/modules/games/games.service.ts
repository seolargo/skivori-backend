import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import * as path from 'path';
import NodeCache from 'node-cache';

/**
 * Service responsible for managing games, including loading games, searching, and caching results.
 */
@Injectable()
export class GamesService implements OnModuleInit {
  private readonly logger = new Logger(GamesService.name);

  // Path to the games data file
  private readonly gamesFilePath = path.join(__dirname, '../../../mocks/game-data.json'); 

  // Cached list of games
  private cachedGames: any[] = []; 

  // Cache for search results with 5-minute TTL
  private searchCache = new NodeCache({ stdTTL: 300 }); 

  // Searchable index for faster querying
  private gameIndex: Map<string, any[]> = new Map(); 

  constructor(private readonly eventEmitter: EventEmitter2) {
    // Load games at startup
    this.loadGamesFromFile(); 
  }

  /**
   * Loads the games data from a JSON file and builds a searchable index.
   * Emits an event after loading the data.
   */
  private loadGamesFromFile(): void {
    try {
      // Read games data from the file
      const data = fs.readFileSync(this.gamesFilePath, 'utf8'); 

      // Parse the data as JSON
      this.cachedGames = JSON.parse(data); 

      // Build the searchable index
      this.buildGameIndex(); 

      this.logger.log('Games data loaded successfully.');

      // Emit an event after loading
      this.eventEmitter.emit('cache.refreshed', { count: this.cachedGames.length }); 
    } catch (error) {
      this.logger.error('Error reading games file:', error);

      this.cachedGames = [];
    }
  }

  /**
   * Builds a searchable index from the loaded games data for efficient querying.
   */
  private buildGameIndex(): void {
    this.logger.log('Building search index...');

    this.cachedGames.forEach((game) => {
      const title = game.title?.toLowerCase();
      if (!title) return;

      // Split the title into words
      const words = title.split(' '); 

      words.forEach((word: string) => {
        if (!this.gameIndex.has(word)) {
          // Initialize an array for the word if it doesn't exist
          this.gameIndex.set(word, []); 
        }

        // Add the game to the index for the word
        this.gameIndex.get(word)?.push(game); 
      });
    });

    this.logger.log('Search index built successfully.');
  }

  /**
   * Retrieves paginated games based on a search query.
   * Caches the results for subsequent requests.
   * 
   * @param {string} searchQuery - The search query to filter games.
   * @param {number} page - The page number for pagination.
   * @param {number} limit - The number of games per page.
   * @returns {{ total: number; page: number; limit: number; paginatedGames: any[] }} An object containing the total games, current page, limit, and paginated games.
   */
  getGames(
    searchQuery: string,
    page: number,
    limit: number
  ): { total: number; page: number; limit: number; paginatedGames: any[] } {
    // Generate a cache key
    const cacheKey = `${searchQuery}-${page}-${limit}`; 
    const cachedResult = this.searchCache.get(cacheKey);

    if (cachedResult) {
      this.logger.log(`Cache hit for query: "${searchQuery}"`);

      return cachedResult as { total: number; page: number; limit: number; paginatedGames: any[] };
    }

    // Process the search query
    const query = (searchQuery || '').toLowerCase().trim();
    let filteredGames: any[] = [];

    if (query) {
      // Search in the index
      this.gameIndex.forEach((games, key) => {
        if (key.includes(query)) {
          filteredGames = filteredGames.concat(games);
        }
      });
    } else {
      // Return all games if no query is provided
      filteredGames = this.cachedGames; 
    }

    // Remove duplicates and paginate the results
    filteredGames = Array.from(new Set(filteredGames));

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedGames = filteredGames.slice(startIndex, endIndex);

    const result = {
      total: filteredGames.length,
      page,
      limit,
      paginatedGames,
    };

    // Cache the result
    this.searchCache.set(cacheKey, result); 

    // Emit search event
    this.eventEmitter.emit('game.search', { query, resultCount: filteredGames.length, page, limit }); 

    return result;
  }

  /**
   * Lifecycle hook called on module initialization to schedule a daily cache refresh.
   */
  onModuleInit(): void {
    this.startDailyCacheRefresh();
  }

  /**
   * Schedules a daily cache refresh at midnight.
   */
  private startDailyCacheRefresh(): void {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);

    const timeUntilMidnight = midnight.getTime() - now.getTime();

    setTimeout(() => {
      this.handleDailyCacheRefresh();

      // Repeat every 24 hours
      setInterval(() => this.handleDailyCacheRefresh(), 24 * 60 * 60 * 1000); 
    }, timeUntilMidnight);
  }

  /**
   * Refreshes the cache by reloading the games data from the file.
   */
  private handleDailyCacheRefresh(): void {
    this.logger.log('Running daily cache refresh...');
    this.loadGamesFromFile();
    this.logger.log('Cache refreshed successfully.');
  }
}
