import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import * as path from 'path';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

// Enum quản lý môi trường để tránh hardcode
enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

// Khởi tạo ứng dụng NestJS với Fastify
async function bootstrap(): Promise<void> {
  try {
    // Khởi tạo app với FastifyAdapter
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
    );

    // Đăng ký multipart cho Fastify (bắt buộc để upload file)
    await app.register(require('@fastify/multipart'));

    // Cấu hình CORS tập trung với validation domain
    app.enableCors({
      origin: (origin, callback) => {
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002',
        ];

        // Cho phép requests không có origin (Postman, mobile apps) hoặc từ allowed origins
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Domain không được phép truy cập'), false);
        }
      },
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    });

    // Đăng ký static files với Fastify
    await app.register(require('@fastify/static'), {
      root: path.join(process.cwd(), 'wwwroot'),
      prefix: '/',
    });

    // Đăng ký global filter và interceptor theo chuẩn NestJS
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Cấu hình ValidationPipe cho toàn app với class-validator
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Cấu hình Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('Job Portal API')
      .setDescription('API documentation cho hệ thống tuyển dụng việc làm')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('swagger', app, document);

    // Khởi động server
    const port = process.env.PORT || 5000;
    await app.listen(port as number, '0.0.0.0');

    // Log thông tin server với enum quản lý environment
    const environment = process.env.NODE_ENV || Environment.DEVELOPMENT;
    console.log('Environment:', environment);
    console.log(`🚀 Server đang chạy tại: http://localhost:${port}`);
    console.log(`📖 Swagger UI: http://localhost:${port}/swagger`);
  } catch (error) {
    console.error('❌ Lỗi khởi tạo server:', error);
    process.exit(1);
  }
}

// Khởi tạo ứng dụng
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
