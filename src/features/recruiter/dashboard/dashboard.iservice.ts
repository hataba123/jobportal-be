// Interface service dashboard recruiter
import { RecruiterDashboardDto } from './dashboard.dto';

export interface IRecruiterDashboardService {
  getDashboard(recruiterId: string): Promise<RecruiterDashboardDto>;
}
