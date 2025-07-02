// Interface service cho Candidate Profile (ứng viên)
import {
  CandidateProfileBriefDto,
  CandidateProfileDetailDto,
  CandidateProfileUpdateDto,
  CandidateApplicationDto,
  CandidateSearchRequest,
} from './candidate-profile.dto';

// Định nghĩa interface cho service Candidate Profile
export interface IRecruiterCandidateService {
  searchCandidates(
    recruiterId: string,
    request: CandidateSearchRequest,
  ): Promise<CandidateProfileBriefDto[]>;
  getCandidateById(
    recruiterId: string,
    candidateId: string,
  ): Promise<CandidateProfileDetailDto | null>;
  getCandidateApplications(
    recruiterId: string,
    candidateId: string,
  ): Promise<CandidateApplicationDto[]>;
  getCandidatesForRecruiter(
    recruiterId: string,
  ): Promise<CandidateProfileBriefDto[]>;
  getByUserId(userId: string): Promise<CandidateProfileDetailDto | null>;
  update(userId: string, dto: CandidateProfileUpdateDto): Promise<boolean>;
  uploadCv(userId: string, file: any): Promise<string | null>;
  deleteCv(userId: string): Promise<boolean>;
}
