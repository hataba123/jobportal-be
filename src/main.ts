import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as path from 'path';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import * as path from 'path';
// import * as express from 'express';

// Khởi tạo ứng dụng NestJS với Fastify. Nếu muốn dùng lại Express, xem phần comment bên dưới.
async function bootstrap() {
  // Khởi tạo app với FastifyAdapter
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Đăng ký multipart cho Fastify (bắt buộc để upload file)
  // Đảm bảo đã cài: npm install @fastify/multipart
  await app.register(require('@fastify/multipart'));

  // Cấu hình CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  // Nếu cần phục vụ static files với Fastify, dùng fastify-static
  // Đảm bảo đã cài: npm install @fastify/static
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await app.register(require('@fastify/static'), {
    root: path.join(process.cwd(), 'wwwroot'),
    prefix: '/',
  });

  // Sử dụng ValidationPipe cho toàn app
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  // Cấu hình Swagger cho Fastify
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
  await app.listen(port as number, '0.0.0.0');

  // In ra thông tin môi trường
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log(`🚀 Server đang chạy tại: http://localhost:${port}`);
  console.log(`📖 Swagger UI: http://localhost:${port}/swagger`);
}
void bootstrap();

// --- Nếu muốn chuyển lại Express, bỏ comment đoạn dưới và comment lại phần Fastify ở trên ---
// async function bootstrap() {
//   const app = await NestFactory.create<NestExpressApplication>(AppModule);
//   app.enableCors({
//     origin: [
//       'http://localhost:3000',
//       'http://localhost:3001',
//       'http://localhost:3002',
//     ],
//     credentials: true,
//   });
//   app.use('/', express.static(path.join(process.cwd(), 'wwwroot')));
//   app.useGlobalPipes(
//     new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
//   );
//   const config = new DocumentBuilder()
//     .setTitle('Job Portal API')
//     .setDescription('API documentation')
//     .setVersion('1.0')
//     .addBearerAuth()
//     .build();
//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('swagger', app, document);
//   const port = process.env.PORT || 5000;
//   await app.listen(port);
//   console.log('Environment:', process.env.NODE_ENV || 'development');
//   console.log(`🚀 Server đang chạy tại: http://localhost:${port}`);
//   console.log(`📖 Swagger UI: http://localhost:${port}/swagger`);
// }
// void bootstrap();
