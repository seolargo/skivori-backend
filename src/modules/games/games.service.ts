import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GamesService implements OnModuleInit {
  private readonly logger = new Logger(GamesService.name);
  private readonly gamesFilePath = path.join(__dirname, '../../../mocks/game-data.json');
  private cachedGames: any[] = [];

  constructor() {
    this.loadGamesFromFile(); // Load games at startup
  }

  private loadGamesFromFile() {
    try {
      const data = fs.readFileSync(this.gamesFilePath, 'utf8');
      this.cachedGames = JSON.parse(data);
      this.logger.log('Games data loaded successfully.');
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

    return {
      total: filteredGames.length,
      page,
      limit,
      paginatedGames,
    };
  }

  // Custom scheduler methods
  onModuleInit() {
    this.startDailyCacheRefresh();
    this.startLoggingGamesCount();
    this.logInitialGamesCount();
  }

  private startDailyCacheRefresh() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Set to next midnight

    const timeUntilMidnight = midnight.getTime() - now.getTime();

    // Schedule the first refresh at midnight
    setTimeout(() => {
      this.handleDailyCacheRefresh();

      // Schedule subsequent refreshes every 24 hours
      setInterval(() => this.handleDailyCacheRefresh(), 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);
  }

  private handleDailyCacheRefresh() {
    this.logger.log('Running daily cache refresh...');
    this.loadGamesFromFile();
    this.logger.log('Cache refreshed successfully.');
  }

  private startLoggingGamesCount() {
    // Log the games count every 60 seconds
    setInterval(() => {
      this.logger.log(`There are currently ${this.cachedGames.length} games in the cache.`);
    }, 60000);
  }

  private logInitialGamesCount() {
    // Log the initial games count 5 seconds after startup
    setTimeout(() => {
      this.logger.log(`Initial games count: ${this.cachedGames.length}`);
    }, 5000);
  }
}