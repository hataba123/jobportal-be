import { Body, Controller, Get, Headers, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { AdminAndRecruiter, Roles } from '../../../common/decorators/roles.decorator';
import { decodeVersion } from '../../../common/concurrency/concurrency';
import { CreateInterviewDto, UpdateInterviewDto, CompleteInterviewDto, InterviewQueryDto } from './interview.dto';
import { InterviewService } from './interview.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/interviews')
export class InterviewController {
  constructor(private readonly service: InterviewService) {}

  @Roles('0', '1', '2')
  @Get()
  list(@Req() req, @Query() query: InterviewQueryDto) {
    return this.service.list(req.user.userId, req.user.role, query);
  }

  @Roles('0', '1', '2')
  @Get(':id')
  get(@Req() req, @Param('id') id: string) {
    return this.service.get(id, req.user.userId, req.user.role);
  }

  @AdminAndRecruiter()
  @Put(':id')
  update(@Req() req, @Param('id') id: string, @Body() body: UpdateInterviewDto, @Headers('if-match') ifMatch?: string) {
    return this.service.update(id, req.user.userId, req.user.role, body, decodeVersion(ifMatch));
  }

  @AdminAndRecruiter()
  @Post(':id/complete')
  complete(@Req() req, @Param('id') id: string, @Body() body: CompleteInterviewDto, @Headers('if-match') ifMatch?: string) {
    return this.service.complete(id, req.user.userId, req.user.role, body, decodeVersion(ifMatch), decodeVersion(body.applicationVersion));
  }

  @AdminAndRecruiter()
  @Post(':id/cancel')
  cancel(@Req() req, @Param('id') id: string, @Headers('if-match') ifMatch?: string) {
    return this.service.cancel(id, req.user.userId, req.user.role, decodeVersion(ifMatch));
  }
}
