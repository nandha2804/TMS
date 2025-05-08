import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './middleware/error.middleware';
import helmet from 'helmet';
import * as compression from 'compression';

async function bootstrap() {
  try {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3003);
    const nodeEnv = configService.get<string>('NODE_ENV', 'development');
    
    // Security headers
    app.use(helmet());
    app.use(compression());

    // Parse CORS origins from env
    const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS', '').split(',').filter(Boolean);
    const allowedMethods = configService.get<string>('ALLOWED_METHODS', '').split(',').filter(Boolean);
    
    if (!allowedOrigins.length) {
      logger.warn('No CORS origins configured, defaulting to localhost:3000,3001');
      allowedOrigins.push('http://localhost:3000', 'http://localhost:3001');
    }

    if (!allowedMethods.length) {
      logger.warn('No CORS methods configured, defaulting to standard methods');
      allowedMethods.push('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS');
    }

    // Enable CORS with configuration from env
    app.enableCors({
      origin: allowedOrigins,
      credentials: true,
      methods: allowedMethods,
      allowedHeaders: ['Content-Type', 'Authorization'],
      preflightContinue: false,
      optionsSuccessStatus: 204,
      exposedHeaders: ['Authorization']
    });

    // Log requests in development
    if (nodeEnv === 'development') {
      app.use((req: any, res: any, next: any) => {
        logger.debug(`${req.method} ${req.url}`, {
          headers: req.headers,
          query: req.query,
          body: req.body
        });
        const start = Date.now();
        res.on('finish', () => {
          const duration = Date.now() - start;
          logger.debug(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
        });
        next();
      });
    }

    // Enable validation
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }));

    // Global error handling
    app.useGlobalFilters(new GlobalExceptionFilter(configService));

    await app.listen(port);
    logger.log(`Application is running in ${nodeEnv} mode on port ${port}`);
    logger.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
  } catch (error) {
    const logger = new Logger('Bootstrap');
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap().catch(error => {
  const logger = new Logger('Bootstrap');
  logger.error('Bootstrap failed:', error);
  process.exit(1);
});
