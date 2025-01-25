import { Handler } from '@netlify/functions';
import { GamesService } from '../../src/modules/games/games.service';
import { appConfig } from '../../src/config/app.config';
import { ValidationPipe } from '../../src/pipes/validation.pipe';
import { EventEmitter2 } from 'eventemitter2'; // EventEmitter2
import { GetGamesQueryDto } from '../../src/modules/games/dto/get-games-query.dto';

// Initialize the eventEmitter
const eventEmitter = new EventEmitter2();

// Initialize the GamesService
const gamesService = new GamesService(eventEmitter);

export const handler: Handler = async (event) => {
  try {
    // Parse query parameters
    const query: Partial<GetGamesQueryDto> = event.queryStringParameters || {};
    const {
      search = '',
      page = appConfig.pagination.defaultPage,
      limit = appConfig.pagination.defaultLimit,
    } = query;

    // Validate query parameters
    new ValidationPipe().transform(query, { type: 'query' });

    // Fetch games using the service
    const result = gamesService.getGames(search, +page, +limit);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
