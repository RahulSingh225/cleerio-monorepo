import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';
import { ApiExceptionFilter, ApiResponseInterceptor } from '@platform/common';

async function bootstrap() {
  // Validate critical environment variables in production
  if (process.env.NODE_ENV === 'production') {
    const requiredEnv = ['DATABASE_URL', 'KAFKA_BROKERS', 'JWT_SECRET'];
    const missing = requiredEnv.filter((k) => !process.env[k]);
    if (missing.length > 0) {
      console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
      process.exit(1);
    }
  }

  const app = await NestFactory.create(AppModule);

  // Increase payload limits for large file uploads and JSON bodies (50MB)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Security Headers
  app.use(helmet());

  // Rate Limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000, // limit each IP to 1000 requests per windowMs
      message: 'Too many requests from this IP, please try again after 15 minutes',
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    }),
  );

  app.use(cookieParser());

  // Configurable CORS
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
  app.enableCors({
    origin: (origin, callback) => {
      // In development, or if no origins specified, allow all
      if (!origin || process.env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ApiResponseInterceptor(reflector));
  app.useGlobalFilters(new ApiExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('v1');

  const port = process.env.API_PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
