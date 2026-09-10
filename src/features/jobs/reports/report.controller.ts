import { Body, Controller, Get, Headers, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AdminOnly, Roles } from '../../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { decodeVersion } from '../../../common/concurrency/concurrency';
import { CreateReportDto, ReportQueryDto, UpdateReportDto } from './report.dto';
import { ReportService } from './report.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/reports')
export class ReportController {
  constructor(private readonly service: ReportService) {}

  @Roles('0', '1', '2')
  @Post()
  create(@Req() req, @Body() dto: CreateReportDto) { return this.service.create(req.user.userId, dto); }

  @AdminOnly()
  @Get()
  list(@Query() query: ReportQueryDto) { return this.service.list(query); }

  @AdminOnly()
  @Patch(':id')
  update(@Req() req, @Param('id') id: string, @Body() dto: UpdateReportDto, @Headers('if-match') ifMatch?: string) {
    return this.service.update(id, req.user.userId, dto.status, decodeVersion(ifMatch));
  }
}
