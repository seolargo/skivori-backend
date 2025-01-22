import { UseInterceptors, Controller, Get, Post, Query, Body, Logger, UsePipes, UseGuards } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { GamesService } from './games.service';
import { GetGamesQueryDto } from './dto/get-games-query.dto';
import { ValidationPipe } from './validation.pipe';

import { Roles } from '@common/decorators/roles.decorator';
import { User } from '@common/decorators/user.decorator';

import { AuthGuard } from '@common/guards/auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

@Controller('games')
export class GamesController {
  private readonly logger = new Logger(GamesController.name);

  constructor(private readonly gamesService: GamesService) {}

  @Get()
  // Apply caching
  @UseInterceptors(CacheInterceptor)
  // Apply validation
  @UsePipes(new ValidationPipe()) 
  // Fetch all games if no query params are given
  getAllGames(
    // Use the DTO for validation
    @Query() query: GetGamesQueryDto, 
  ): { total: number; page: number; limit: number; paginatedGames: any[] } {
    const { search = '', page = 1, limit = 10 } = query;

    // Default behavior: fetch all games with default pagination
    this.logger.log('Fetching all games with default parameters.');
    return this.gamesService.getGames(search, page, limit); // Default search, page, limit
  }

  @Post('search')
  // Apply caching
  @UseInterceptors(CacheInterceptor)
  // Apply validation for the POST request
  @UsePipes(new ValidationPipe())
  // Search for games
  searchGames(
    // Use the DTO for validation
    @Body() query: GetGamesQueryDto,
  ): { total: number; page: number; limit: number; paginatedGames: any[] } {
    const { search = '', page = 1, limit = 10 } = query;

    // Log the query parameters for debugging
    this.logger.log(`Search: ${search}, Page: ${page}, Limit: ${limit}`);

    // Call the service method
    return this.gamesService.getGames(search, page, limit);
  }

  /*
    @Get('admin')
    // Custom roles decorator
    @Roles('admin')
    // Apply guards to the route 
    @UseGuards(AuthGuard, RolesGuard)
    getAdminGames(@User() user: any) {
      return { message: 'Admin games route', user };
    }
  */
}