// Import các decorator, guard, và service cần thiết
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
import { CompanyService } from './company.service';
import { CreateCompanyDto, UpdateCompanyDto } from './company.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

// Controller quản lý công ty cho admin
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Admin')
@Controller('api/admin/companies')
export class CompanyController {
  // Inject service xử lý nghiệp vụ
  constructor(private readonly companyService: CompanyService) {}

  // Lấy tất cả công ty
  @Get()
  async getAll() {
    return await this.companyService.getAllCompanies();
  }

  // Lấy chi tiết công ty theo id
  @Get(':id')
  async getById(@Param('id') id: string) {
    const c = await this.companyService.getCompanyById(id);
    if (!c) throw new NotFoundException('Company not found');
    return c;
  }

  // Tạo mới công ty
  @Post()
  async create(@Body() dto: CreateCompanyDto) {
    return await this.companyService.createCompany(dto);
  }

  // Cập nhật công ty
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    const updated = await this.companyService.updateCompany(id, dto);
    if (!updated) throw new NotFoundException('Company not found');
    return;
  }

  // Xóa công ty
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    const deleted = await this.companyService.deleteCompany(id);
    if (!deleted) throw new NotFoundException('Company not found');
    return;
  }
}
