import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import * as express from 'express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const logger = new Logger('ZIP-Microservice');
  const app = await NestFactory.create(AppModule);

  // 🚀 Increase JSON body limit to 50MB (adjust as needed)
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

  await app.listen(3000);
  logger.log('ZIP Microservice running at http://localhost:3000');
  logger.log('Swagger docs available at /api-docs');
}
bootstrap();
