import {
  CompanyDto,
  CreateCompanyDto,
  UpdateCompanyDto,
  UpdateCompanyVerificationDto,
} from './company.dto';
import { PageQueryDto, PagedResult } from '../../../common/dto/pagination.dto';

// Interface service quản lý công ty
export interface ICompanyService {
  getAllCompanies(): Promise<CompanyDto[]>;
  getAllCompaniesPaged(query: PageQueryDto): Promise<PagedResult<CompanyDto>>;
  getCompanyById(id: string): Promise<CompanyDto | null>;
  createCompany(dto: CreateCompanyDto): Promise<CompanyDto>;
  updateCompany(id: string, dto: UpdateCompanyDto, expectedVersion?: number): Promise<boolean>;
  deleteCompany(id: string, expectedVersion?: number): Promise<boolean>;
  updateVerificationStatus(
    id: string,
    dto: UpdateCompanyVerificationDto,
    expectedVersion?: number,
  ): Promise<CompanyDto | null>;
}
