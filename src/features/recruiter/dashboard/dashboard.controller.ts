// Controller dashboard recruiter
import { Controller, Get, Param } from '@nestjs/common';
import { RecruiterDashboardService } from './dashboard.service';
import { RecruiterDashboardDto } from './dashboard.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

// Controller lấy dashboard recruiter
@Controller('api/recruiter/dashboard')
export class RecruiterDashboardController {
  constructor(private readonly dashboardService: RecruiterDashboardService) {}

  // Lấy dashboard theo recruiterId
  @Get(':recruiterId')
  async getDashboard(
    @Param('recruiterId') recruiterId: string,
  ): Promise<RecruiterDashboardDto> {
    return this.dashboardService.getDashboard(recruiterId);
  }
}
