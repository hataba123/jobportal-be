import { Module } from '@nestjs/common';
import { InterviewController } from './interview.controller';
import { JobApplicationInterviewController } from './job-application-interview.controller';
import { InterviewService } from './interview.service';

@Module({
  controllers: [InterviewController, JobApplicationInterviewController],
  providers: [InterviewService],
  exports: [InterviewService],
})
export class InterviewModule {}
