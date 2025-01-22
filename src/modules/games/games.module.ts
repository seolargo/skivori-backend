import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true, // Make the cache available globally
      ttl: 5000, // Set the TTL (time-to-live) for cached items
    }),
    JwtModule.register({
      secret: 'your-secret-key', // Replace with a secure key
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}