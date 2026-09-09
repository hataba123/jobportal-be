import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Observable } from 'rxjs';

const CORRELATION_ID_HEADER = 'x-correlation-id';
const SAFE_CORRELATION_ID = /^[A-Za-z0-9._:-]{1,128}$/;

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<any>();
    const response = http.getResponse<any>();
    const incoming = request.headers?.[CORRELATION_ID_HEADER];
    const candidate = Array.isArray(incoming) ? incoming[0] : incoming;
    const correlationId =
      typeof candidate === 'string' && SAFE_CORRELATION_ID.test(candidate)
        ? candidate
        : randomUUID();

    request.correlationId = correlationId;
    if (typeof response.header === 'function') {
      response.header(CORRELATION_ID_HEADER, correlationId);
    } else if (typeof response.setHeader === 'function') {
      response.setHeader(CORRELATION_ID_HEADER, correlationId);
    }
    return next.handle();
  }
}
