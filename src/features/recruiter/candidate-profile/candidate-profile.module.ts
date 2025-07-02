// Module quản lý Candidate Profile cho recruiter/candidate
import { Module } from '@nestjs/common';
import { RecruiterCandidateProfileController } from './candidate-profile.controller';
import { RecruiterCandidateService } from './candidate-profile.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [RecruiterCandidateProfileController],
  providers: [RecruiterCandidateService, PrismaService],
  exports: [RecruiterCandidateService],
})
export class CandidateProfileModule {}
