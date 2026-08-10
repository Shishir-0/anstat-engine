import { Job, JobType, JobStatus } from '../../types/job';
import { PaginatedResult, PaginationParams } from '../../types/common';

export interface JobsService {
  listJobs(params?: PaginationParams & { type?: JobType; status?: JobStatus }): Promise<PaginatedResult<Job>>;
  getJobById(id: string): Promise<Job | null>;
  cancelJob(id: string): Promise<boolean>;
  getJobLogs(id: string): Promise<string[]>;
}
