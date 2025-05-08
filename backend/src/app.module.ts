import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3002),
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        MONGODB_URI: Joi.string().required(),
        MONGODB_USER: Joi.string().required(),
        MONGODB_PASS: Joi.string().required(),
        JWT_SECRET: Joi.string().required().min(32),
        JWT_EXPIRES_IN: Joi.string().required(),
        JWT_REFRESH_EXPIRES_IN: Joi.string().required(),
        RATE_LIMIT_WINDOW: Joi.number().required(),
        RATE_LIMIT_MAX_REQUESTS: Joi.number().required(),
        LOGIN_RATE_LIMIT_WINDOW: Joi.number().required(),
        LOGIN_RATE_LIMIT_MAX_ATTEMPTS: Joi.number().required(),
        ALLOWED_ORIGINS: Joi.string().required(),
        PASSWORD_SALT_ROUNDS: Joi.number().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('MONGODB_URI'),
        retryWrites: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([
        {
          ttl: config.getOrThrow<number>('RATE_LIMIT_WINDOW'),
          limit: config.getOrThrow<number>('RATE_LIMIT_MAX_REQUESTS'),
        },
      ]),
    }),
    AuthModule,
    UsersModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
