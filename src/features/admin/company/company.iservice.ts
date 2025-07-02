import { CompanyDto, CreateCompanyDto, UpdateCompanyDto } from './company.dto';

// Interface service quản lý công ty
export interface ICompanyService {
  getAllCompanies(): Promise<CompanyDto[]>;
  getCompanyById(id: string): Promise<CompanyDto | null>;
  createCompany(dto: CreateCompanyDto): Promise<CompanyDto>;
  updateCompany(id: string, dto: UpdateCompanyDto): Promise<boolean>;
  deleteCompany(id: string): Promise<boolean>;
}
