import { Body, Controller, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { RecruiterOnly } from '../../../common/decorators/roles.decorator';
import { decodeVersion } from '../../../common/concurrency/concurrency';
import { CreateInterviewDto } from './interview.dto';
import { InterviewService } from './interview.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/jobapplication/:applicationId/interviews')
export class JobApplicationInterviewController {
  constructor(private readonly service: InterviewService) {}

  @RecruiterOnly()
  @Post()
  create(@Req() req, @Param('applicationId') applicationId: string, @Body() body: CreateInterviewDto, @Headers('if-match') ifMatch?: string) {
    return this.service.create(applicationId, req.user.userId, body, decodeVersion(ifMatch));
  }
}
