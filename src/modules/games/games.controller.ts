import { UseInterceptors, Controller, Get, Post, Query, Body, Logger, UsePipes } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { GamesService } from './games.service';
import { GetGamesQueryDto } from './dto/get-games-query.dto';
import { ValidationPipe } from './validation.pipe';

@Controller('games')
export class GamesController {
  private readonly logger = new Logger(GamesController.name);

  constructor(private readonly gamesService: GamesService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new ValidationPipe()) 
  getAllGames(
    @Query() query: GetGamesQueryDto, 
  ): { total: number; page: number; limit: number; paginatedGames: any[] } {
    const { search = '', page = 1, limit = 10 } = query;

    // Default behavior: fetch all games with default pagination
    this.logger.log('Fetching all games with default parameters.');
    
    // Default search, page, limit
    return this.gamesService.getGames(search, page, limit); 
  }

  @Post('search')
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new ValidationPipe())
  searchGames(
    @Body() query: GetGamesQueryDto,
  ): { total: number; page: number; limit: number; paginatedGames: any[] } {
    const { search = '', page = 1, limit = 10 } = query;

    // Log the query parameters for debugging
    this.logger.log(`Search: ${search}, Page: ${page}, Limit: ${limit}`);

    // Call the service method
    return this.gamesService.getGames(search, page, limit);
  }
}