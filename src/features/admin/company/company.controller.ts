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
  Patch,
  Headers,
  Query,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  UpdateCompanyVerificationDto,
} from './company.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { decodeVersion } from '../../../common/concurrency/concurrency';
import { PageQueryDto } from '../../../common/dto/pagination.dto';

// Controller quản lý công ty cho admin
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('0')
@Controller('api/admin/companies')
export class CompanyController {
  // Inject service xử lý nghiệp vụ
  constructor(private readonly companyService: CompanyService) {}

  // Lấy tất cả công ty
  @Get()
  async getAll(@Query() query?: PageQueryDto) {
    if (query) return this.companyService.getAllCompaniesPaged(query);
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
  async update(@Param('id') id: string, @Body() dto: UpdateCompanyDto, @Headers('if-match') ifMatch?: string) {
    const updated = await this.companyService.updateCompany(id, dto, decodeVersion(ifMatch));
    if (!updated) throw new NotFoundException('Company not found');
    return;
  }

  // Xóa công ty
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Headers('if-match') ifMatch?: string) {
    const deleted = await this.companyService.deleteCompany(id, decodeVersion(ifMatch));
    if (!deleted) throw new NotFoundException('Company not found');
    return;
  }

  @Patch(':id/verification')
  async updateVerification(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyVerificationDto,
    @Headers('if-match') ifMatch?: string,
  ) {
    const company = await this.companyService.updateVerificationStatus(id, dto, decodeVersion(ifMatch));
    if (!company) throw new NotFoundException('Company not found');
    return company;
  }
}
