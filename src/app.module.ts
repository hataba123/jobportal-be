import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Core modules
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './features/auth/auth.module';

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

// User modules
import { BlogsModule } from './features/user/blogs/blogs.module';
import { CategoryModule } from './features/user/category/category.module';
import { CompanyModule as UserCompanyModule } from './features/user/company/company.module';
import { NotificationModule as UserNotificationModule } from './features/user/notification/notification.module';
import { ReviewModule as UserReviewModule } from './features/user/review/review.module';
import { SavedJobModule } from './features/user/saved-job/saved-job.module';

@Module({
  imports: [
    // Core infrastructure
    PrismaModule,
    AuthModule,

    // Recruiter features
    RecruiterDashboardModule,
    RecruiterCompanyModule,
    CandidateProfileModule,

    // Jobs features
    JobPostModule,
    JobApplicationModule,

    // Admin features
    UserModule,
    ReviewModule,
    NotificationModule,
    AdminJobPostModule,
    AdminDashboardModule,
    CompanyModule,

    // User features
    BlogsModule,
    CategoryModule,
    UserCompanyModule,
    UserNotificationModule,
    UserReviewModule,
    SavedJobModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
