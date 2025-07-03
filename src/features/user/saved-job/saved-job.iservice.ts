import { SavedJobDto } from './saved-job.dto';

// Interface service cho saved job (user)
export interface ISavedJobService {
  getSavedJobsAsync(userId: string): Promise<SavedJobDto[]>;
  saveJobAsync(userId: string, jobPostId: string): Promise<void>;
  unsaveJobAsync(userId: string, jobPostId: string): Promise<boolean>;
}
