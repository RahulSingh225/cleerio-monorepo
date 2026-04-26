import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  // Use NestFactory.create for a hybrid application (HTTP + Microservice)
  const app = await NestFactory.create(AppModule);

  // Increase payload limits for large JSON bodies/files (50MB)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Connect the Kafka microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
      },
      consumer: {
        groupId: 'collections-worker-pool',
      },
    },
  });

  // Start microservices
  await app.startAllMicroservices();
  
  // Start HTTP server for health checks
  const port = process.env.WORKER_PORT ?? 3002;
  await app.listen(port, '0.0.0.0');
  
  console.log(`Worker Hybrid App is listening on port ${port} (HTTP) and Kafka events...`);
}
bootstrap();
