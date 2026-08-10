import { JobsService } from '../interfaces/jobs.service';
import { Job, JobType, JobStatus } from '../../types/job';
import { PaginatedResult, PaginationParams } from '../../types/common';
import { MOCK_JOBS } from '../../mock/seed-data';

export class MockJobsService implements JobsService {
  private jobs: Job[] = [...MOCK_JOBS];

  async listJobs(params?: PaginationParams & { type?: JobType; status?: JobStatus }): Promise<PaginatedResult<Job>> {
    let filtered = [...this.jobs];
    if (params?.type) {
      filtered = filtered.filter(j => j.type === params.type);
    }
    if (params?.status) {
      filtered = filtered.filter(j => j.status === params.status);
    }
    if (params?.query) {
      const q = params.query.toLowerCase();
      filtered = filtered.filter(j => j.title.toLowerCase().includes(q) || (j.repositoryName && j.repositoryName.toLowerCase().includes(q)));
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;

    return {
      data: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit) || 1,
    };
  }

  async getJobById(id: string): Promise<Job | null> {
    return this.jobs.find(j => j.id === id) || null;
  }

  async cancelJob(id: string): Promise<boolean> {
    const job = this.jobs.find(j => j.id === id);
    if (job) {
      job.status = 'cancelled';
      return true;
    }
    return false;
  }

  async getJobLogs(id: string): Promise<string[]> {
    const job = await this.getJobById(id);
    if (!job) return ['[ERROR] Job not found'];

    return [
      `[${job.startedAt}] INFO  Worker allocated for job type: ${job.type}`,
      `[${job.startedAt}] INFO  Model selected: ${job.modelId || 'claude-3-5-sonnet'}`,
      ...job.steps.map(s => `[${s.startedAt || job.startedAt}] STEP  ${s.name} (${s.status.toUpperCase()}) ${s.details ? `- ${s.details}` : ''}`),
      ...job.events.map(e => `[${e.timestamp}] ${e.level.toUpperCase()} ${e.message}`),
      job.completedAt ? `[${job.completedAt}] SUCCESS Job finished with status: ${job.status}` : `[PROGRESS] Current job progress: ${job.progress}%`,
    ];
  }
}
