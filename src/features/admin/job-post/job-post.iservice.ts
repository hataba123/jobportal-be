// Interface service cho job post (admin)
import { JobPostDto, CreateJobPostDto, UpdateJobPostDto } from './job-post.dto';
import { PageQueryDto, PagedResult } from '../../../common/dto/pagination.dto';

export interface IJobPostService {
  getAllJobPosts(): Promise<JobPostDto[]>;
  getAllJobPostsPaged(query: PageQueryDto): Promise<PagedResult<JobPostDto>>;
  getJobPostById(id: string): Promise<JobPostDto | null>;
  createJobPost(dto: CreateJobPostDto): Promise<JobPostDto>;
  updateJobPost(id: string, dto: UpdateJobPostDto, expectedVersion?: number): Promise<boolean>;
  deleteJobPost(id: string, expectedVersion?: number): Promise<boolean>;
}
