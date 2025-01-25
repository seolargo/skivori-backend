import { Handler } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { GamesService } from '../../src/modules/games/games.service';

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
    // Bootstrap NestJS app if not already initialized
    if (!app) {
      app = await NestFactory.createApplicationContext(AppModule);
    }

    const gamesService = app.get(GamesService);

    // Extract query parameters
    const { search = '', page = 1, limit = 10 } = event.queryStringParameters || {};

    // Fetch games using the service
    const result = gamesService.getGames(search, +page, +limit);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Allow all origins
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error in getAllGames function:', error.message);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*', // Allow all origins
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      },
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
