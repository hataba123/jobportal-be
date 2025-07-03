// Interface service cho công ty
import { CompanyDto } from './company.dto';

export interface ICompanyService {
  getAllAsync(): Promise<CompanyDto[]>;
  getByIdAsync(id: string): Promise<CompanyDto | null>;
}
