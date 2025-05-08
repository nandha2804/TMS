import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security middleware
  app.use(helmet());
  app.use(compression());
  
  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(','),
    methods: process.env.ALLOWED_METHODS?.split(','),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Get port from environment variable or use default
  const port = process.env.PORT || 3003;
  
  await app.listen(port, '0.0.0.0', () => {
    console.log(`Application is running on port ${port}`);
  });
}
bootstrap();
