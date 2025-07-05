// Interceptor ghi log request và response để debug
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// Enum quản lý các pattern cần skip logging
enum SkipLoggingPattern {
  HEALTH = '/health',
  FAVICON = '/favicon',
  STATIC = '/static',
  UPLOADS = '/uploads',
  SWAGGER = '/swagger',
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  // Ghi log cho request và response theo chuẩn NestJS
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const startTime = Date.now();

    // Chỉ log các route quan trọng, bỏ qua health check và static files
    if (this.shouldSkipLogging(url)) {
      return next.handle();
    }

    this.logger.log(`${method} ${url} - Request bắt đầu`);

    return next.handle().pipe(
      tap({
        next: (response) => {
          const duration = Date.now() - startTime;
          this.logger.log(`${method} ${url} - Hoàn thành trong ${duration}ms`);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `${method} ${url} - Lỗi trong ${duration}ms: ${error.message}`,
          );
        },
      }),
    );
  }

  // Kiểm tra có nên bỏ qua logging không sử dụng enum
  private shouldSkipLogging(url: string): boolean {
    const skipPatterns = Object.values(SkipLoggingPattern);
    return skipPatterns.some((pattern) => url.includes(pattern));
  }
}
