import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { GameDto } from './dto/game.dto'; // Adjust the path as necessary
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class GamesService {
  private readonly gamesFilePath = path.join(__dirname, '../../../mocks/game-data.json');
  private cachedGames: any[] = [];

  constructor() {
    try {
      const data = fs.readFileSync(this.gamesFilePath, 'utf8');
      this.cachedGames = JSON.parse(data);
    } catch (error) {
      console.error('Error reading games file:', error);
      this.cachedGames = [];
    }
  }

  getGames(searchQuery: string, page: number, limit: number) {
    console.log('getGames is called!');
    const query = (searchQuery || '').toLowerCase().trim();

    const filteredGames = query
      ? this.cachedGames.filter((game) => game.title?.toLowerCase().includes(query))
      : this.cachedGames;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedGames = filteredGames.slice(startIndex, endIndex);

    // Transform raw game data into GameDto
    const transformedGames = plainToInstance(
      GameDto,
      paginatedGames.map((game) => ({
        ...game,
        thumbnail: game.thumb?.url || null, // Flatten the thumb property
      })),
      {
        excludeExtraneousValues: true, // Ensures only exposed fields are included
      },
    );

    return {
      total: filteredGames.length,
      page,
      limit,
      paginatedGames: transformedGames,
    };
  }
}
