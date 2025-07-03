// Controller quản lý công ty cho user
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { CompanyService } from './company.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Companies')
@Controller('api/companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  // Lấy tất cả công ty
  @Get()
  async getAll() {
    return this.companyService.getAllAsync();
  }

  // Lấy công ty theo id
  @Get(':id')
  async getById(@Param('id') id: string) {
    const company = await this.companyService.getByIdAsync(id);
    if (!company) throw new NotFoundException();
    return company;
  }
}
