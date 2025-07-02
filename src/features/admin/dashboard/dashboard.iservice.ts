// Interface service cho dashboard admin
import { DashboardDto } from './dashboard.dto';

export interface IDashboardService {
  // Lấy thống kê dashboard
  getDashboardStats(): Promise<DashboardDto>;
}
