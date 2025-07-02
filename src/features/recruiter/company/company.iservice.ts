// Interface service cho recruiter thao tác công ty
import { RecruiterCompanyDto, RecruiterUpdateCompanyDto } from './company.dto';

export interface IRecruiterCompanyService {
  getMyCompany(employerId: string): Promise<RecruiterCompanyDto | null>;
  updateMyCompany(
    employerId: string,
    dto: RecruiterUpdateCompanyDto,
  ): Promise<boolean>;
  deleteMyCompany(employerId: string): Promise<boolean>;
}
