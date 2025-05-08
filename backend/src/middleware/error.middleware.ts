import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';

interface ErrorDetails {
  field?: string;
  message: string;
  [key: string]: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isDevelopment: boolean;

  constructor(private configService: ConfigService) {
    this.isDevelopment = configService.get<string>('NODE_ENV') !== 'production';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let details: ErrorDetails[] | null = null;

    // Handle different types of errors
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      message = typeof errorResponse === 'string' 
        ? errorResponse 
        : (errorResponse as any).message || exception.message;
      
      if (typeof errorResponse === 'object' && (errorResponse as any).error) {
        details = [{ message: (errorResponse as any).error }];
      }
    } 
    // Handle MongoDB Duplicate Key Error
    else if (exception instanceof MongoError && (exception as any).code === 11000) {
      status = HttpStatus.CONFLICT;
      message = 'Duplicate entry';
      const keyValue = (exception as any).keyValue;
      if (keyValue) {
        details = [{ 
          message: 'Duplicate key error',
          fields: keyValue 
        }];
      }
    }
    // Handle Mongoose Validation Error
    else if (exception instanceof MongooseError.ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation error';
      details = Object.values(exception.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
    }
    // Handle other known errors
    else if (exception instanceof Error) {
      message = exception.message;
      if (this.isDevelopment) {
        details = [{ 
          message: exception.message,
          stack: exception.stack 
        }];
      }
    }

    // Log the error
    const errorLog = {
      status,
      message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      ...(this.isDevelopment && {
        details,
        stack: exception instanceof Error ? exception.stack : undefined,
        body: request.body,
        query: request.query,
        params: request.params,
      })
    };

    this.logger.error('Request error:', errorLog);

    // Send response
    const responseBody = {
      statusCode: status,
      message,
      ...(this.isDevelopment && details && { details }),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response
      .status(status)
      .json(responseBody);
  }
}