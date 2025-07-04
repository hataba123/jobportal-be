// Hàm chuyển role dạng số về enum string (Admin/Recruiter/Candidate)
function userRoleNumberToString(role: number): UserRole {
  if (role === UserRoleEnum.Admin) return UserRole.Admin;
  if (role === UserRoleEnum.Recruiter) return UserRole.Recruiter;
  if (role === UserRoleEnum.Candidate) return UserRole.Candidate;
  // fallback: nếu FE truyền 0/1/2 trực tiếp
  if (role === 0) return UserRole.Admin;
  if (role === 1) return UserRole.Recruiter;
  if (role === 2) return UserRole.Candidate;
  return UserRole.Candidate;
}
// Controller quản lý user cho admin
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  NotFoundException,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './user.dto';
import { UserRole } from './user.dto';
import {
  UserRoleEnum,
  UserRoleStringToIndex,
} from 'src/features/auth/auth.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('0')
@Controller('api/admin/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Lấy tất cả user, mapping role enum string -> số chuẩn hóa
  @Get()
  async getAll() {
    const users = await this.userService.getAllUsers();
    return users.map((u) => ({
      ...u,
      // Mapping role từ enum string sang số chuẩn hóa
      role: UserRoleStringToIndex[u.role as string] ?? UserRoleEnum.Candidate,
    }));
  }

  // Lấy user theo id, mapping role enum string -> số chuẩn hóa
  @Get(':id')
  async getById(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    if (!user) throw new NotFoundException('User not found');
    return {
      ...user,
      role:
        UserRoleStringToIndex[user.role as string] ?? UserRoleEnum.Candidate,
    };
  }

  // Tạo mới user
  @Post()
  async create(@Body() dto: CreateUserDto) {
    return await this.userService.createUser(dto);
  }

  // Cập nhật user, chuẩn hóa role từ số sang string, bắt log lỗi
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    try {
      let data = { ...dto };
      // Nếu FE gửi role là số, convert về enum string cho đúng DTO validate
      if (typeof data.role === 'number') {
        // Mapping ngược: từ số về string (Admin/Recruiter/Candidate)
        data.role = userRoleNumberToString(data.role);
      }
      const updated = await this.userService.updateUser(id, data);
      if (!updated) throw new NotFoundException('User not found');
      return;
    } catch (error) {
      // Ghi log lỗi chi tiết khi cập nhật user
      console.error('Lỗi cập nhật user:', { id, dto, error });
      throw error;
    }
  }

  // Xóa user
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    const deleted = await this.userService.deleteUser(id);
    if (!deleted) throw new NotFoundException('User not found');
    return;
  }
}
