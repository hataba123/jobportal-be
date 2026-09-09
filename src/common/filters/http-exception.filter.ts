// Filter xử lý exception toàn cục, chuẩn hóa error response
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Xác định status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Chuẩn hóa body trả về
    const body = {
      statusCode: status,
      code: this.errorCode(status),
      traceId: String(
        request.id ?? request.headers?.['x-correlation-id'] ?? 'unknown',
      ),
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message || 'Internal server error',
      error: exception.name || undefined,
      // Nếu có lỗi chi tiết từ class-validator
      errors: exception.response?.errors || undefined,
    };

    // Nếu là Fastify reply (có hàm .send), dùng reply.status().send()
    if (typeof response.send === 'function') {
      response.status(status).send(body);
    } else if (typeof response.json === 'function') {
      // Nếu là Express response, dùng .status().json()
      response.status(status).json(body);
    } else {
      // Fallback: trả về trực tiếp
      response.end(JSON.stringify(body));
    }
  }

  private errorCode(status: number): string {
    if (status === HttpStatus.BAD_REQUEST) return 'BAD_REQUEST';
    if (status === HttpStatus.UNAUTHORIZED) return 'UNAUTHORIZED';
    if (status === HttpStatus.FORBIDDEN) return 'FORBIDDEN';
    if (status === HttpStatus.NOT_FOUND) return 'NOT_FOUND';
    if (status === HttpStatus.CONFLICT) return 'CONFLICT';
    if (status === HttpStatus.TOO_MANY_REQUESTS) return 'RATE_LIMITED';
    return status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'HTTP_ERROR';
  }
}
