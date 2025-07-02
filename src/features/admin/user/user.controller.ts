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
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@Controller('api/admin/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Lấy tất cả user
  @Get()
  async getAll() {
    return await this.userService.getAllUsers();
  }

  // Lấy user theo id
  @Get(':id')
  async getById(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // Tạo mới user
  @Post()
  async create(@Body() dto: CreateUserDto) {
    return await this.userService.createUser(dto);
  }

  // Cập nhật user
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const updated = await this.userService.updateUser(id, dto);
    if (!updated) throw new NotFoundException('User not found');
    return;
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
