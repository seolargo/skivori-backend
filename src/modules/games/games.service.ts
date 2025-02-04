import { Injectable, Logger, OnModuleInit, Inject  } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import NodeCache from 'node-cache';
import { appConfig } from '../../config/app.config'; 
import * as path from 'path';
import { GetGamesResult } from './interfaces/interfaces';

/**
 * Service responsible for managing games, including loading games, searching, and caching results.
 */
@Injectable()
export class GamesService implements OnModuleInit {
  private readonly logger = new Logger(GamesService.name);

  private readonly gamesFilePath: string;

  // Cached list of games
  private cachedGames: any[] = [];

  // Cache for search results with configurable TTL
  private searchCache = new NodeCache({ stdTTL: appConfig.cache.stdTTL });

  // Searchable index for faster querying
  private gameIndex: Map<string, any[]> = new Map();

  constructor(@Inject(EventEmitter2) private readonly eventEmitter: EventEmitter2) {
    // Use process.cwd() for dynamic resolution in Netlify
    this.gamesFilePath = path.resolve(
      process.cwd(),
      'src',
      'mocks',
      'game-data.json'
    );

    // Load games at startup
    this.loadGamesFromFile();    
  }

  /*
      Game Index

      Keyword         Games
    1 dead            ['Legacy of Games'] 
    2 of              ['Legacy of Dead', 'Lord Merlin and the Lady of the Lake', 'Carol of the Elves', 'Vault of Fortune', 'Tome of Madness']
    3 legacy          ['Legacy of Dead']
    4 ...
    5
    6
  */

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

    this.cachedGames.forEach((game) => {
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
   * 
   * @example
   * // Initialize an empty game index
   * const gameIndex = new Map();
   *
   * // Sample game data
   * const game = { id: 1, title: 'Legacy of Dead' };
   *
   * // Split the title into words
   * const words = game.title.toLowerCase().split(' ');
   *
   * // Add the game to the index
   * addGameToIndex(words, gameIndex, game);
   *
   * console.log(gameIndex);
   * // Output:
   * // Map {
   * //   'legacy' => [{ id: 1, title: 'Legacy of Dead' }],
   * //   'of' => [{ id: 1, title: 'Legacy of Dead' }],
   * //   'dead' => [{ id: 1, title: 'Legacy of Dead' }]
   * // }
  */
  private addGameToIndex(
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
   * 
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
    * 
    * @returns {any[]} - The filtered list of games matching the query.
    * 
    * @example
    * const gameIndex = new Map();
    * gameIndex.set('legacy', [{ id: 1, title: 'Legacy of Dead' }]);
    * gameIndex.set('dead', [{ id: 1, title: 'Legacy of Dead' }]);
    * gameIndex.set('wild', [{ id: 2, title: 'Wild Wild Riches' }, { id: 3, title: 'Wild West Gold' }]);
    * gameIndex.set('fortune', [{ id: 4, title: 'Nero\'s Fortune' }, { id: 5, title: 'Vault of Fortune' }]);
    *
    * // Search for games containing the keyword 'wild'
    * const result = filterGamesFromIndex('wild', gameIndex);
    * console.log(result);
    * // Output:
    * // [
    * //   { id: 2, title: 'Wild Wild Riches' },
    * //   { id: 3, title: 'Wild West Gold' }
    * // ]
   */
  filterGamesFromIndex(query: string, gameIndex: Map<string, any[]>): any[] {
    // Initialize an empty array to store the filtered games
    let filteredGames: any[] = [];
    
    // Iterate over each entry in the game index (key: keyword, value: array of games)
    gameIndex.forEach((games, key) => {
      // Check if the current keyword contains the search query (for partial matching)
      if (key.includes(query)) {
        // If a match is found, concatenate the matching games to the filteredGames array
        filteredGames = filteredGames.concat(games);
      }
    });

    // Return the final list of filtered games that match the query
    return filteredGames;
  }

  /**
   * Lifecycle hook called on module initialization to schedule a daily cache refresh.
   */
  onModuleInit(): void {
    this.startDailyCacheRefresh();
  }

  // This code is designed to automatically refresh the cache containing game data every day at midnight. 
  // It ensures that the cached data stays up-to-date without requiring manual intervention.

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
