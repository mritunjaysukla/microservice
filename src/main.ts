import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('ZIP-Microservice');

  // Create hybrid application that supports both HTTP and TCP
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose'], // Add all log levels
  });
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3001,
    },
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Zip Microservice API')
    .setDescription('API to create zip archives from files stored in S3 (Datahub)')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Add more detailed logging
  logger.log('Application starting...');
  logger.log(`Environment: ${process.env.NODE_ENV}`);
  logger.log('Swagger documentation is available at http://localhost:3000/api-docs');

  app.useGlobalPipes(new ValidationPipe());

  await app.startAllMicroservices();
  await app.listen(3000);

  // Add port listening confirmation
  logger.log('HTTP Server is listening on http://localhost:3000');
  logger.log('TCP Microservice is listening on port 3001');
}

bootstrap().catch(err => {
  console.error('Application failed to start:', err);
  process.exit(1);
});