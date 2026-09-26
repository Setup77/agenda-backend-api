import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const isProduction = process.env.NODE_ENV === 'production';

  // ✅ Production CORS Settings
  app.enableCors({
    // In production, allow all or specify your exact frontend URL (e.g., 'https://hostingersite.com')
    origin: isProduction ? true : 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'HEAD', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ✅ Production Session Configuration
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'CAPTCHA_CSRF_SECRET', // Dynamized secret
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction, // MUST be true in production for HTTPS deployment
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax', // 'none' allows cross-domain cookies between frontend & backend Web Apps
      },
    }),
  );

  // ✅ Global DTO Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ✅ Hostinger requires listening on process.env.PORT
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on port: ${port}`);
}

bootstrap();
