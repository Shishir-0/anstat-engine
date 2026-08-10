import { CodeJob, CodeIssueContext, CodePlan } from '../../types/code';
import { PaginatedResult, PaginationParams } from '../../types/common';
import { JobStatus } from '../../types/job';

export interface CodeJobFilters extends PaginationParams {
  status?: JobStatus;
  repositoryId?: string;
}

export interface CreateCodeJobInput {
  repositoryId: string;
  repositoryName: string;
  issue: CodeIssueContext;
  modelId: string;
  selectedFiles: string[];
  validationLevel: 'quick' | 'standard' | 'deep';
  securityLevel: 'standard' | 'strict';
}

export interface CodeService {
  listJobs(params?: CodeJobFilters): Promise<PaginatedResult<CodeJob>>;
  getJob(id: string): Promise<CodeJob | null>;
  createJob(input: CreateCodeJobInput): Promise<CodeJob>;
  buildContext(jobId: string): Promise<CodeJob>;
  generatePlan(jobId: string): Promise<CodeJob>;
  approvePlan(jobId: string): Promise<CodeJob>;
  requestPlanChanges(jobId: string, feedback: string): Promise<CodeJob>;
  generatePatch(jobId: string): Promise<CodeJob>;
  validate(jobId: string): Promise<CodeJob>;
  runSecurityScan(jobId: string): Promise<CodeJob>;
  createPullRequest(jobId: string): Promise<CodeJob>;
  cancelJob(jobId: string): Promise<CodeJob>;
  retryJob(jobId: string): Promise<CodeJob>;
}
