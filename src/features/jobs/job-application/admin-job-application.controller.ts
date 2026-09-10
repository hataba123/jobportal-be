import { Body, Controller, Headers, Param, Put, Req, UseGuards } from '@nestjs/common';
import { AdminOnly } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { decodeVersion } from '../../../common/concurrency/concurrency';
import { JobApplicationService } from './job-application.service';
import { UpdateApplyStatusRequest } from './job-application.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/admin/jobapplications')
export class AdminJobApplicationController {
  constructor(private readonly service: JobApplicationService) {}

  @AdminOnly()
  @Put(':id/status')
  async override(
    @Req() req,
    @Param('id') id: string,
    @Body() body: UpdateApplyStatusRequest,
    @Headers('if-match') ifMatch?: string,
  ) {
    const version = decodeVersion(ifMatch);
    const ok = await this.service.updateStatus(
      id,
      body.requestedStatus,
      req.user.userId,
      true,
      version,
      body.reason,
    );
    return { success: ok, version: (await this.service.getById(id))?.version };
  }
}
