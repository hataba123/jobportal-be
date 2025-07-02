import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// Recruiter modules
import { RecruiterDashboardModule } from './features/recruiter/dashboard/dashboard.module';
import { RecruiterCompanyModule } from './features/recruiter/company/company.module';
import { CandidateProfileModule } from './features/recruiter/candidate-profile/candidate-profile.module';
// Jobs modules
import { JobPostModule } from './features/jobs/job-post/job-post.module';
import { JobApplicationModule } from './features/jobs/job-application/job-application.module';
// Admin modules
import { UserModule } from './features/admin/user/user.module';
import { ReviewModule } from './features/admin/review/review.module';
import { NotificationModule } from './features/admin/notification/notification.module';
import { JobPostModule as AdminJobPostModule } from './features/admin/job-post/job-post.module';
import { DashboardModule as AdminDashboardModule } from './features/admin/dashboard/dashboard.module';
import { CompanyModule } from './features/admin/company/company.module';

@Module({
  imports: [
    RecruiterDashboardModule,
    RecruiterCompanyModule,
    CandidateProfileModule,
    JobPostModule,
    JobApplicationModule,
    UserModule,
    ReviewModule,
    NotificationModule,
    AdminJobPostModule,
    AdminDashboardModule,
    CompanyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
