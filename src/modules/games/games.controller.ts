import { UseInterceptors, Controller, Get, Query, Logger } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { GamesService } from './games.service';

@Controller('games')
export class GamesController {
  private readonly logger = new Logger(GamesController.name);
  constructor(private readonly gamesService: GamesService) {}

    @Get()
    @UseInterceptors(CacheInterceptor) // Apply at the method level
    getGames(
      @Query('search') search: string = '',
      @Query('page') page: number = 1,
      @Query('limit') limit: number = 10,
    ): { total: number; page: number; limit: number; paginatedGames: any[] } {
      return this.gamesService.getGames(search, page, limit);
    }

    /*
  @Get() // This means the route for this method is `/games`
  getGames() {
    this.logger.log('GET /games called');
    return 'Hello from GamesController';
  }
    */
}
