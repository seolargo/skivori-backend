import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path'; // Use `join` to resolve paths
import { GamesModule } from './modules/games/games.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true, // Make the cache available globally
      ttl: 5000, // Set the TTL (time-to-live) for cached items
    }),
    ConfigModule.forRoot({
      isGlobal: true, // Makes configuration globally available
      envFilePath: `development.env`, // Dynamically load the correct .env file
    }),
    //SequelizeModule.forRoot({}),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client', 'build'), // Resolve the correct path
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60, // Time-to-live for requests (in seconds)
          limit: 100, // Maximum number of requests per IP within TTL
        },
      ],
    }),
    GamesModule, // Import the GamesModule
  ],
  controllers: [], // Add global controllers here (if any)
  providers: [], // Add global providers here (if any)
})
export class AppModule {}