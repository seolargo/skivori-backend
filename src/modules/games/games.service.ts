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
  private gameIndex: Map<string, any[]> = new Map(); // Searchable index

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.loadGamesFromFile(); // Load games at startup
  }

  private loadGamesFromFile() {
    try {
      const data = fs.readFileSync(this.gamesFilePath, 'utf8');
      this.cachedGames = JSON.parse(data);
      this.buildGameIndex(); // Build index after loading games
      this.logger.log('Games data loaded successfully.');
      this.eventEmitter.emit('cache.refreshed', { count: this.cachedGames.length });
    } catch (error) {
      this.logger.error('Error reading games file:', error);
      this.cachedGames = [];
    }
  }

  private buildGameIndex() {
    this.logger.log('Building search index...');
    this.cachedGames.forEach((game) => {
      const title = game.title?.toLowerCase();
      if (!title) return;

      const words = title.split(' ');
      words.forEach((word: string) => {
        if (!this.gameIndex.has(word)) {
          this.gameIndex.set(word, []);
        }
        this.gameIndex.get(word)?.push(game);
      });
    });
    this.logger.log('Search index built successfully.');
  }

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
    let filteredGames: any[] = [];
  
    if (query) {
      // Use forEach to iterate over the Map entries (compatible with older targets)
      this.gameIndex.forEach((games, key) => {
        if (key.includes(query)) {
          filteredGames = filteredGames.concat(games);
        }
      });
    } else {
      // If no query, return all games
      filteredGames = this.cachedGames;
    }
  
    // Remove duplicates (if any) caused by multiple matches
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
  
    // Save result to cache
    this.searchCache.set(cacheKey, result);
  
    // Emit a search event
    this.eventEmitter.emit('game.search', {
      query,
      resultCount: filteredGames.length,
      page,
      limit,
    });
  
    return result;
  }

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
