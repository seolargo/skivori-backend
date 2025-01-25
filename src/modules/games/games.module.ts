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
      isGlobal: true,
      ttl: 5000,
    }),
    JwtModule.register({
      secret: 'your-secret-key', // Replace with a secure key
      signOptions: { expiresIn: '1h' },
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [GamesController],
  providers: [GamesService, GameListener],
  exports: [GamesService],
})
export class GamesModule {}