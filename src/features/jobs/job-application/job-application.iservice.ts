import {
  JobApplicationRequest,
  UpdateApplyStatusRequest,
  ApplyDto,
  CandidateApplicationDto,
  JobAppliedDto,
} from './job-application.dto';
import { PageQueryDto, PagedResult } from '../../../common/dto/pagination.dto';

// Interface service quản lý ứng tuyển việc làm
export interface IJobApplicationService {
  applyToJob(
    candidateId: string,
    request: JobApplicationRequest,
  ): Promise<void>;
  getCandidatesForJob(
    recruiterId: string,
    jobPostId: string,
  ): Promise<CandidateApplicationDto[]>;
  getCandidatesForJobPaged(
    recruiterId: string,
    jobPostId: string,
    query: PageQueryDto,
  ): Promise<PagedResult<CandidateApplicationDto>>;
  getMyAppliedJobs(candidateId: string): Promise<JobAppliedDto[]>;
  getMyAppliedJobsPaged(candidateId: string, query: PageQueryDto): Promise<PagedResult<JobAppliedDto>>;
  getAll(): Promise<ApplyDto[]>;
  getAllPaged(query: PageQueryDto): Promise<PagedResult<ApplyDto>>;
  getById(id: string): Promise<ApplyDto | null>;
  updateStatus(id: string, status: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
