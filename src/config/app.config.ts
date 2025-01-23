import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const appConfig = {
  cache: {
    // Cache TTL in seconds (default: 300)
    stdTTL: parseInt(process.env.CACHE_TTL || '300', 10), 
  },
  files: {
    // Path to the games data file
    gamesFilePath: path.join(__dirname, '../../mocks/game-data.json'), 
  },
  schedule: {
    // 24 hours in milliseconds
    cacheRefreshInterval: 24 * 60 * 60 * 1000, 
  },
  pagination: {
    defaultPage: parseInt(process.env.DEFAULT_PAGE || '1', 10), // Default page for pagination
    defaultLimit: parseInt(process.env.DEFAULT_LIMIT || '10', 10), // Default limit for pagination
  },
  events: {
    // Event emitted after cache refresh
    cacheRefreshed: 'cache.refreshed', 
    // Event emitted after a game search
    gameSearch: 'game.search', 
  },
};

export default appConfig;
