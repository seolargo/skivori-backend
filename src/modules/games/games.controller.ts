import { UseInterceptors, Controller, Get, Query, Logger, UsePipes, UseGuards } from '@nestjs/common';
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
  getGames(
    // Use the DTO for validation
    @Query() query: GetGamesQueryDto, 
  ): { total: number; page: number; limit: number; paginatedGames: any[] } {
    // Set default values if query parameters are not provided
    const { search = '', page = 1, limit = 10 } = query;

    // Log the query parameters for debugging
    this.logger.log(`Search: ${search}, Page: ${page}, Limit: ${limit}`);

    // Call the service method
    return this.gamesService.getGames(search, page, limit);
  }

  @Get('admin')
  @Roles('admin') // Custom roles decorator
  @UseGuards(AuthGuard, RolesGuard) // Apply guards
  getAdminGames(@User() user: any) {
    return { message: 'Admin games route', user };
  }
}