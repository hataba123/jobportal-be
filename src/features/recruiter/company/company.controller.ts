// Controller quản lý công ty cho recruiter
import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { RecruiterCompanyService } from './company.service';
import { RecruiterUpdateCompanyDto, RecruiterCompanyDto } from './company.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

// Controller cho recruiter thao tác công ty của mình
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('1')
@Controller('api/recruiter/company')
export class RecruiterCompanyController {
  constructor(private readonly companyService: RecruiterCompanyService) {}

  // Lấy thông tin công ty của recruiter hiện tại
  @Get()
  async getMyCompany(@Req() req): Promise<RecruiterCompanyDto> {
    const recruiterId = req.user?.userId;
    const company = await this.companyService.getMyCompany(recruiterId);
    if (!company)
      throw new NotFoundException(
        'Không tìm thấy công ty mà bạn đang quản lý.',
      );
    // Đảm bảo trả về tags là mảng string cho FE
    return {
      ...company,
      // Đảm bảo tags luôn là mảng string, fix lỗi type 'never'
      tags:
        typeof company.tags === 'string'
          ? (company.tags as string)
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : Array.isArray(company.tags)
            ? (company.tags as string[])
            : [],
    };
  }

  // Cập nhật thông tin công ty
  @Put()
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateMyCompany(
    @Req() req,
    @Body() dto: RecruiterUpdateCompanyDto,
  ): Promise<void> {
    const recruiterId = req.user?.userId;
    // DTO đã tự động convert và cắt length, không cần xử lý thêm
    const success = await this.companyService.updateMyCompany(recruiterId, dto);
    if (!success)
      throw new NotFoundException(
        'Không thể cập nhật vì không tìm thấy công ty phù hợp hoặc bạn không có quyền.',
      );
  }

  // Xóa công ty
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMyCompany(@Req() req): Promise<void> {
    const recruiterId = req.user?.userId;
    const success = await this.companyService.deleteMyCompany(recruiterId);
    if (!success)
      throw new NotFoundException(
        'Không thể xoá công ty (có thể do còn bài đăng tuyển dụng hoặc bạn không có quyền).',
      );
  }
}
