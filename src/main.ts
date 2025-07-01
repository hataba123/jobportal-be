import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Khởi tạo ứng dụng NestJS
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 5000;

  await app.listen(port);

  // In đường dẫn server ra terminal
  console.log(`🚀 Server đang chạy tại: http://localhost:${port}`);
  console.log(
    `📖 API Documentation có thể truy cập tại: http://localhost:${port}/api`,
  );
}
void bootstrap();
