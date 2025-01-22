import compression from 'compression';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
    credentials: true, // Allow cookies and credentials
  });

  // Use compression middleware globally
  app.use(compression({
    level: 6, // Compression level (0-9, where 9 is highest compression)
    threshold: 1024, // Only compress responses larger than 1 KB
  }));

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  // Start the application
  await app.listen(3001);
  console.log('Server is running on http://localhost:3001');
}

bootstrap();
