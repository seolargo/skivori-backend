import { Injectable, Logger, OnModuleInit, Controller, Post, Body } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import * as path from 'path';
import NodeCache from 'node-cache';

@Injectable()
export class GamesService implements OnModuleInit {
  private readonly logger = new Logger(GamesService.name);
  private readonly gamesFilePath = path.join(__dirname, '../../../mocks/game-data.json');
  private cachedGames: any[] = [];
  private searchCache = new NodeCache({ stdTTL: 300 }); // Cache with 5-minute TTL
  private gameIndex: Record<string, Set<any>> = {}; // Optimized searchable index

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.loadGamesFromFile(); // Load games at startup
  }

  /**
   * Load games data from file
   */
  private loadGamesFromFile() {
    try {
      const data = fs.readFileSync(this.gamesFilePath, 'utf8');
      this.cachedGames = JSON.parse(data);
      this.buildGameIndex(); // Build index after loading games
      this.logger.log(`Games data loaded successfully. Total games: ${this.cachedGames.length}`);
      this.eventEmitter.emit('cache.refreshed', { count: this.cachedGames.length });
    } catch (error) {
      this.logger.error('Error reading games file:', error);
      this.cachedGames = [];
    }
  }

  /**
   * Build an optimized index for games to support efficient search
   */
  private buildGameIndex() {
    this.logger.log('Building optimized search index...');
    this.gameIndex = {}; // Reset the previous index

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
   * Retrieve paginated games based on a search query
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
   * Schedule daily cache refresh
   */
  onModuleInit() {
    this.startDailyCacheRefresh();
  }

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

  private handleDailyCacheRefresh() {
    this.logger.log('Running daily cache refresh...');
    this.loadGamesFromFile();
    this.logger.log('Cache refreshed successfully.');
  }
}

@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @Post('search')
  searchGames(@Body('searchQuery') searchQuery: string, @Body('page') page: number, @Body('limit') limit: number) {
    const pageNumber = Math.max(page || 1, 1); // Ensure page >= 1
    const limitNumber = Math.min(Math.max(limit || 10, 1), 50); // Ensure 1 <= limit <= 50

    return this.gamesService.getGames(searchQuery, pageNumber, limitNumber);
  }
}
