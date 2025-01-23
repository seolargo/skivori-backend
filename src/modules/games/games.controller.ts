import { UseInterceptors, Controller, Get, Post, Query, Body, Logger, UsePipes } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { GamesService } from './games.service';
import { GetGamesQueryDto } from './dto/get-games-query.dto';
import { ValidationPipe } from './validation.pipe';

/**
 * Controller for handling games-related API endpoints.
 */
@Controller('games')
export class GamesController {
  private readonly logger = new Logger(GamesController.name);

  /**
   * Constructor to inject the `GamesService` dependency.
   *
   * @param {GamesService} gamesService - The service that handles game-related operations.
   */
  constructor(private readonly gamesService: GamesService) {}

  /**
   * Endpoint to retrieve all games with optional search and pagination.
   *
   * @param {GetGamesQueryDto} query - The query parameters for search, page, and limit.
   * @returns {object} - Returns the total count, current page, limit, and the paginated list of games.
   */
  @Get()
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new ValidationPipe())
  getAllGames(
    @Query() query: GetGamesQueryDto,
  ): { total: number; page: number; limit: number; paginatedGames: any[] } {
    const { search = '', page = 1, limit = 10 } = query;

    // Log the action for debugging purposes
    this.logger.log('Fetching all games with default parameters.');

    // Fetch and return games from the service
    return this.gamesService.getGames(search, page, limit);
  }

  /**
   * Endpoint to search for games based on a query with pagination.
   *
   * @param {GetGamesQueryDto} query - The search parameters provided in the request body.
   * @returns {object} - Returns the total count, current page, limit, and the paginated list of matching games.
   */
  @Post('search')
  @UseInterceptors(CacheInterceptor)
  @UsePipes(new ValidationPipe())
  searchGames(
    @Body() query: GetGamesQueryDto,
  ): { total: number; page: number; limit: number; paginatedGames: any[] } {
    const { search = '', page = 1, limit = 10 } = query;

    // Log the query parameters for debugging
    this.logger.log(`Search: ${search}, Page: ${page}, Limit: ${limit}`);

    // Fetch and return games matching the search criteria
    return this.gamesService.getGames(search, page, limit);
  }
}
