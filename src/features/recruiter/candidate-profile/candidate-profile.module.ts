// Module quản lý Candidate Profile cho recruiter/candidate
import { Module } from '@nestjs/common';
import { RecruiterCandidateProfileController } from './candidate-profile.controller';
import { RecruiterCandidateService } from './candidate-profile.service';

@Module({
  controllers: [RecruiterCandidateProfileController],
  providers: [RecruiterCandidateService],
  exports: [RecruiterCandidateService],
})
export class CandidateProfileModule {}
