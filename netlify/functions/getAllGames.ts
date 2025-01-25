import { Handler } from '@netlify/functions';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { GamesService } from '../../src/modules/games/games.service';
import { getCommonHeaders } from '../../src/common/utils/utils';

// Cache the NestJS app instance
let app; 

export const handler: Handler = async (event) => {
  // Handle preflight OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: getCommonHeaders(),
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
    const { 
      search = '', 
      page = 1, 
      limit = 10 
    } = event.queryStringParameters || {};

    // Fetch games using the service
    const result = gamesService.getGames(
      search, 
      +page, 
      +limit
    );

    return {
      statusCode: 200,
      headers: getCommonHeaders(),
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error('Error in getAllGames function:', error.message);
    
    return {
      statusCode: 500,
      headers: getCommonHeaders(),
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
