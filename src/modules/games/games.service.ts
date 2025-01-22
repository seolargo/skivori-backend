import { Injectable, Logger, OnModuleInit, Controller, Post, Body } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GamesService implements OnModuleInit {
  private readonly logger = new Logger(GamesService.name);
  private readonly gamesFilePath = path.join(__dirname, '../../../mocks/game-data.json');
  private cachedGames: any[] = [];

  constructor(private readonly eventEmitter: EventEmitter2) {
    this.loadGamesFromFile(); // Load games at startup
  }

  private loadGamesFromFile() {
    try {
      const data = fs.readFileSync(this.gamesFilePath, 'utf8');
      this.cachedGames = JSON.parse(data);
      this.logger.log('Games data loaded successfully.');
      this.eventEmitter.emit('cache.refreshed', { count: this.cachedGames.length });
    } catch (error) {
      this.logger.error('Error reading games file:', error);
      this.cachedGames = [];
    }
  }

  getGames(searchQuery: string, page: number, limit: number) {
    const query = (searchQuery || '').toLowerCase().trim();
    const filteredGames = query
      ? this.cachedGames.filter((game) => game.title?.toLowerCase().includes(query))
      : this.cachedGames;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedGames = filteredGames.slice(startIndex, endIndex);

    // Emit a search event
    this.eventEmitter.emit('game.search', {
      query,
      resultCount: filteredGames.length,
      page,
      limit,
    });

    return {
      total: filteredGames.length,
      page,
      limit,
      paginatedGames,
    };
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
    // Provide default values if page or limit are not provided
    const pageNumber = page || 1;
    const limitNumber = limit || 10;

    return this.gamesService.getGames(searchQuery, pageNumber, limitNumber);
  }
}
