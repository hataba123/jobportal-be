// Interceptor chuẩn hóa response trả về cho client
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Interface cho response chuẩn hóa
export interface StandardResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, StandardResponse<T>>
{
  // Chuẩn hóa response format cho tất cả API
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Nếu response đã có structure success/data thì giữ nguyên
        if (data && typeof data === 'object' && 'success' in data) {
          return data as StandardResponse<T>;
        }

        // Nếu chưa có thì wrap lại theo chuẩn
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
