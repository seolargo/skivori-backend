import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GamesModule } from './modules/games/games.module';

import { APP_INTERCEPTOR } from '@nestjs/core';

import { JwtModule } from '@nestjs/jwt';

// Middleware Imports
import { LoggerMiddleware } from '@common/middlewares/logger.middleware';
import { RateLimitMiddleware } from '@common/middlewares/ratelimit.middleware';
import { ResponseTransformMiddleware } from '@common/middlewares/responsetransform.middleware';
import { ErrorHandlingMiddleware } from '@common/middlewares/error-handling.middleware';
import { JwtAuthMiddleware } from '@common/middlewares/jwtauth.middleware';
import { SanitizationMiddleware } from '@common/middlewares/sanitization.middleware';
import { HealthCheckMiddleware } from '@common/middlewares/healthcheck.middleware';
import { GlobalHeaderMiddleware } from '@common/middlewares/global-header.middleware';

// Interceptor Imports
import { LoggingInterceptor } from '@common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from '@common/interceptors/response-transform.interceptor';
import { ErrorHandlingInterceptor } from '@common/interceptors/error-handling.interceptor';
import { TimeoutInterceptor } from '@common/interceptors/timeout.interceptor';
import { CachingInterceptor } from '@common/interceptors/caching.interceptor';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 5000,
    }),
    JwtModule.register({
      secret: 'your-secret-key', // Replace with a secure key
      signOptions: { expiresIn: '1h' }, // Token expiration
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `development.env`,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client', 'build'),
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 100,
        },
      ],
    }),
    GamesModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor, // Logs execution time
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformInterceptor, // Transforms responses
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorHandlingInterceptor, // Catches and formats errors
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor, // Sets request timeout
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CachingInterceptor, // Implements caching
    },
  ],
  controllers: [],
  exports: [JwtModule]
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        LoggerMiddleware, // Logs every request
        RateLimitMiddleware, // Limits the number of requests per IP
        ResponseTransformMiddleware, // Transforms all responses
        ErrorHandlingMiddleware, // Handles errors consistently
        JwtAuthMiddleware, // Adds JWT authentication
        SanitizationMiddleware, // Sanitizes input data
        HealthCheckMiddleware, // Provides a /health endpoint
        GlobalHeaderMiddleware, // Adds custom headers to all responses
      )
      .exclude(
        { path: '/', method: RequestMethod.GET }, // Exclude specific routes
        { path: '/games', method: RequestMethod.GET }, // Add other routes to exclude as needed
      )
      .forRoutes('*'); // Apply to all routes
  }
}
