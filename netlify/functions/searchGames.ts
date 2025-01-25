import { Handler } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { GamesService } from '../../src/modules/games/games.service';
import { ValidationPipe } from '../../src/pipes/validation.pipe';
import { GetGamesQueryDto } from '../../src/modules/games/dto/get-games-query.dto';
import { Logger } from '@nestjs/common';

let app; // Cache the NestJS app instance

export const handler: Handler = async (event) => {
  // Handle preflight OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: '',
    };
  }

  try {
    // Bootstrap the NestJS app if not already initialized
    if (!app) {
      app = await NestFactory.createApplicationContext(AppModule, {
        logger: false, // Optional: Disable logger for performance
      });
    }

    const logger = new Logger(GamesService.name);

    const gamesService = app.get(GamesService);

    // Parse body for query parameters
    const query: Partial<GetGamesQueryDto> = JSON.parse(event.body || '{}');
    const {
      search = '',
      page = 1,
      limit = 10,
    } = query;

    logger.log(`Searching for games with query: ${JSON.stringify(query)}`);

    // Validate body parameters
    new ValidationPipe().transform(query, { type: 'body' });

    // Fetch games using the service
    const result = gamesService.getGames(search, +page, +limit);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error in handler function:', error.message);

    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify({ message: error.message }),
    };
  }
};
