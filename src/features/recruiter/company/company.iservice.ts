// Interface service cho recruiter thao tác công ty
import { RecruiterCompanyDto, RecruiterUpdateCompanyDto } from './company.dto';

export interface IRecruiterCompanyService {
  getMyCompany(employerId: string): Promise<RecruiterCompanyDto | null>;
  updateMyCompany(
    employerId: string,
    dto: RecruiterUpdateCompanyDto,
    expectedVersion?: number,
  ): Promise<boolean>;
  deleteMyCompany(employerId: string, expectedVersion?: number): Promise<boolean>;
}
