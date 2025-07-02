// Interface service cho job post (admin)
import { JobPostDto, CreateJobPostDto, UpdateJobPostDto } from './job-post.dto';

export interface IJobPostService {
  getAllJobPosts(): Promise<JobPostDto[]>;
  getJobPostById(id: string): Promise<JobPostDto | null>;
  createJobPost(dto: CreateJobPostDto): Promise<JobPostDto>;
  updateJobPost(id: string, dto: UpdateJobPostDto): Promise<boolean>;
  deleteJobPost(id: string): Promise<boolean>;
}
