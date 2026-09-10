// Interface service cho Candidate Profile (ứng viên)
import {
  CandidateProfileBriefDto,
  CandidateProfileDetailDto,
  CandidateProfileUpdateDto,
  CandidateApplicationDto,
  CandidateSearchRequest,
} from './candidate-profile.dto';
import { PagedResult } from '../../../common/dto/pagination.dto';

// Định nghĩa interface cho service Candidate Profile
export interface IRecruiterCandidateService {
  searchCandidates(
    recruiterId: string,
    request: CandidateSearchRequest,
  ): Promise<CandidateProfileBriefDto[]>;
  searchCandidatesPaged(
    recruiterId: string,
    request: CandidateSearchRequest,
  ): Promise<PagedResult<CandidateProfileBriefDto>>;
  getCandidateById(
    recruiterId: string,
    candidateId: string,
  ): Promise<CandidateProfileDetailDto | null>;
  getCandidateApplications(
    recruiterId: string,
    candidateId: string,
  ): Promise<CandidateApplicationDto[]>;
  getCandidateApplicationsPaged(
    recruiterId: string,
    candidateId: string,
    page: number,
    pageSize: number,
  ): Promise<PagedResult<CandidateApplicationDto>>;
  getCandidatesForRecruiter(
    recruiterId: string,
  ): Promise<CandidateProfileBriefDto[]>;
  getCandidatesForRecruiterPaged(
    recruiterId: string,
    request: CandidateSearchRequest,
  ): Promise<PagedResult<CandidateProfileBriefDto>>;
  getByUserId(userId: string): Promise<CandidateProfileDetailDto | null>;
  update(userId: string, dto: CandidateProfileUpdateDto): Promise<boolean>;
  uploadCv(userId: string, file: any): Promise<string | null>;
  deleteCv(userId: string): Promise<boolean>;
  getCvFile(
    actorId: string,
    candidateId: string,
    isAdmin?: boolean,
  ): Promise<{ buffer: Buffer; fileName: string } | null>;
}
