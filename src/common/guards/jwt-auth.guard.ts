// Guard xác thực JWT cho NestJS
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // Đảm bảo đã cài @nestjs/passport
// Guard kiểm tra JWT, dùng cho route cần xác thực
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Có thể custom thêm logic nếu cần
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }
}
