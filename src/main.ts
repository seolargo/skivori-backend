import compression from 'compression';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    // Allow requests from this origin
    origin: 'http://localhost:3000', 
    // Allowed HTTP methods
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
    // Allow cookies and credentials to be sent
    credentials: true, 
  });

  // Use compression middleware globally
  app.use(
    compression({
      // Compression level (0-9, where 9 is highest compression)
      level: 6, 

      // Only compress responses larger than 1 KB
      threshold: 1024, 
    })
  );

  // Global prefix for API routes
  app.setGlobalPrefix('api');

  // Start the application
  await app.listen(3001);
  
  console.log('Server is running on http://localhost:3001');
}

bootstrap();
