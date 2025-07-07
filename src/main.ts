import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as bodyParser from 'body-parser';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) return String((error as any).message);
  return 'Unknown error occurred';
}

async function bootstrap() {
  const logger = new Logger('ZIP-Microservice');
  const app = await NestFactory.create(AppModule);

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('ZIP Microservice')
    .setDescription('Zips presigned S3 files')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  process.on('unhandledRejection', (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise} reason: ${getErrorMessage(reason)}`);
  });

  process.on('uncaughtException', (error) => {
    logger.error(`Uncaught Exception: ${getErrorMessage(error)}`);
  });

  await app.listen(3000);
  logger.log('ZIP Microservice running at http://localhost:3000');
  logger.log('Swagger docs available at http://localhost:3000/api-docs');
}

bootstrap();
