import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ApiExceptionFilter, ApiResponseInterceptor } from '@platform/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  // Allow any origin in development to support cross-network access (mobile/tablets)
  app.enableCors({
    origin: (origin, callback) => {
      // In development, we can be more permissive
      callback(null, true);
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

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
