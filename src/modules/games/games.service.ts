import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import NodeCache from 'node-cache';
import { appConfig } from '../../config/app.config'; 
import { GetGamesResult } from './interfaces/interfaces';

/**
 * Service responsible for managing games, including loading games, searching, and caching results.
 */
@Injectable()
export class GamesService implements OnModuleInit {
  private readonly logger = new Logger(GamesService.name);

  // Cached list of games
  private cachedGames: any[] = [];

  // Cache for search results with configurable TTL
  private searchCache = new NodeCache({ stdTTL: appConfig.cache.stdTTL });

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
      const data = fs.readFileSync(appConfig.files.gamesFilePath, 'utf8');

      // Parse the data as JSON
      this.cachedGames = JSON.parse(data);

      // Build the searchable index
      this.buildGameIndex();

      this.logger.log('Games data loaded successfully.');

      // Emit an event after loading
      this.eventEmitter.emit(
        appConfig.events.cacheRefreshed, 
        {
          count: this.cachedGames.length,
        }
      );
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

    this.cachedGames
      .forEach((game) => {
        const title = game.title?.toLowerCase();
        if (!title) return;

        // Split the title into words
        const words = title.split(' ');

        this.addGameToIndex(
          words, 
          this.gameIndex, 
          game
        );
    });

    this.logger.log('Search index built successfully.');
  }

  /**
   * Adds a game to the index by splitting its title into individual words.
   *
   * @param {string[]} words - An array of words to be used as keys in the index.
   * @param {Map<string, any[]>} gameIndex - The index where games are stored based on their keywords.
   * @param {any} game - The game object to be indexed.
  */
  addGameToIndex(
    words: string[], 
    gameIndex: Map<string, any[]>, 
    game: any
  ): void {
    words.forEach((word: string) => {
      if (!gameIndex.has(word)) {
        // Initialize an array for the word if it doesn't exist
        gameIndex.set(word, []);
      }

      // Add the game to the index for the word
      gameIndex.get(word)?.push(game);
    });
  }

  /**
   * Retrieves paginated games based on a search query.
   * Caches the results for subsequent requests.
   *
   * @param {string} searchQuery - The search query to filter games.
   * @param {number} page - The page number for pagination.
   * @param {number} limit - The number of games per page.
   * @returns {GetGamesResult} An object containing the total games, current page, limit, and paginated games.
   */
  getGames(
    searchQuery: string,
    page: number,
    limit: number
  ): GetGamesResult {
    // Generate a cache key
    const cacheKey = `${searchQuery}-${page}-${limit}`;
    const cachedResult = this.searchCache.get(cacheKey);

    if (cachedResult) {
      this.logger.log(`Cache hit for query: "${searchQuery}"`);

      return cachedResult as GetGamesResult;
    }

    // Process the search query
    const query = (searchQuery || '').toLowerCase().trim();
    let filteredGames: any[] = [];

    if (query) {
      filteredGames = this.filterGamesFromIndex(query, this.gameIndex);
    } else {
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
    this.eventEmitter.emit(
      appConfig.events.gameSearch, 
      {
        query,
        resultCount: filteredGames.length,
        page,
        limit,
      }
    );

    return result;
  }

  /**
   * Filters games from the index based on the query string.
   *
   * @param {string} query - The search query string.
   * @param {Map<string, any[]>} gameIndex - The index containing game keywords mapped to game arrays.
   * @returns {any[]} - The filtered list of games matching the query.
   */
  filterGamesFromIndex(query: string, gameIndex: Map<string, any[]>): any[] {
    let filteredGames: any[] = [];
    
    gameIndex.forEach((games, key) => {
      if (key.includes(query)) {
        filteredGames = filteredGames.concat(games);
      }
    });

    return filteredGames;
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
      setInterval(
        () => this.handleDailyCacheRefresh(),
        appConfig.schedule.cacheRefreshInterval
      );
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
