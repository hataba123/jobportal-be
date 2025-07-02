import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import * as express from 'express';

// Khởi tạo ứng dụng NestJS với các cấu hình tương tự .NET Core
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Cấu hình CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    credentials: true,
  });

  // Cấu hình static files (tương tự UseStaticFiles)
  app.use('/', express.static(path.join(process.cwd(), 'wwwroot')));

  // Sử dụng ValidationPipe cho toàn app
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // Cấu hình Swagger cho tài liệu API
  // Truy cập http://localhost:5000/swagger để xem giao diện Swagger UI
  const config = new DocumentBuilder()
    .setTitle('Job Portal API')
    .setDescription('API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // Lắng nghe trên port (giữ nguyên port như cũ)
  const port = process.env.PORT || 5000;
  await app.listen(port);

  // In ra thông tin môi trường
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log(`🚀 Server đang chạy tại: http://localhost:${port}`);
  console.log(`📖 Swagger UI: http://localhost:${port}/swagger`);
}
void bootstrap();
