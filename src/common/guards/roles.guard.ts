// Guard kiểm tra quyền truy cập (role) cho NestJS
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

// Guard kiểm tra role dựa trên decorator @Roles
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  // Kiểm tra user có role phù hợp với requiredRoles không
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user || user.role === undefined) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }
    // So sánh role dạng số hoặc string đều được
    const hasRole = requiredRoles.some((role) => user.role == role);
    if (!hasRole) {
      throw new ForbiddenException('Bạn không có quyền truy cập');
    }
    return true;
  }
}
