import { Injectable, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GamesService {
  private readonly gamesFilePath = path.join(__dirname, '../../../mocks/game-data.json');
  private cachedGames: any[] = [];

  constructor() {
    const data = fs.readFileSync(this.gamesFilePath, 'utf8');
    this.cachedGames = JSON.parse(data);
  }

  @UseInterceptors(CacheInterceptor)
  getGames(searchQuery: string, page: number, limit: number) {
    const query = searchQuery.toLowerCase().trim();
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
}
