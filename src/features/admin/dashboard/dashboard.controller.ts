// Controller quản lý dashboard cho admin
import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('0')
@Controller('api/admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // Lấy thống kê dashboard
  @Get()
  async getStats() {
    return await this.dashboardService.getDashboardStats();
  }
}
