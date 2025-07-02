// Decorator chỉ định role cho route/controller
import { SetMetadata } from '@nestjs/common';

// Sử dụng: @Roles('Admin')
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
