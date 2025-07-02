import {
  JobApplicationRequest,
  UpdateApplyStatusRequest,
  ApplyDto,
  CandidateApplicationDto,
  JobAppliedDto,
} from './job-application.dto';

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
  getMyAppliedJobs(candidateId: string): Promise<JobAppliedDto[]>;
  getAll(): Promise<ApplyDto[]>;
  getById(id: string): Promise<ApplyDto | null>;
  updateStatus(id: string, status: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
