import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { MatchQueryDto } from './matching.dto';
import { MatchingService } from './matching.service';

@Controller('api/matches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('jobs')
  @Roles('2')
  getRecommendedJobs(@Req() req: any, @Query() query: MatchQueryDto) {
    return this.matchingService.getRecommendedJobs(req.user.userId, query);
  }

  @Get('job-posts/:jobPostId/candidates')
  @Roles('0', '1')
  rankCandidates(
    @Req() req: any,
    @Param('jobPostId') jobPostId: string,
    @Query() query: MatchQueryDto,
  ) {
    const isAdmin = String(req.user.role) === '0';
    return this.matchingService.rankCandidates(req.user.userId, jobPostId, isAdmin, query);
  }

  @Get('job-posts/:jobPostId/candidates/:candidateId')
  @Roles('0', '1')
  getCandidateMatch(
    @Req() req: any,
    @Param('jobPostId') jobPostId: string,
    @Param('candidateId') candidateId: string,
  ) {
    const isAdmin = String(req.user.role) === '0';
    return this.matchingService.getCandidateMatch(
      req.user.userId,
      jobPostId,
      candidateId,
      isAdmin,
    );
  }
}
