import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';
import { JwtModule } from '@nestjs/jwt';
import { GameListener } from './listeners/game.listener';
import { EventEmitterModule } from '@nestjs/event-emitter';

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
    EventEmitterModule.forRoot(), // Import EventEmitter locally if not global
  ],
  controllers: [GamesController],
  providers: [GamesService, GameListener],
})
export class GamesModule {}