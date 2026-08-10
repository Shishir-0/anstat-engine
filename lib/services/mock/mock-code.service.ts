import { CodeService, CodeJobFilters, CreateCodeJobInput } from '../interfaces/code.service';
import { CodeJob, CodeIssueContext } from '../../types/code';
import { PaginatedResult } from '../../types/common';
import { MockAIService } from './mock-ai.service';
import { MockValidationService } from './mock-validation.service';
import { MOCK_SECURITY_FINDINGS } from '../../mock/seed-data';

const SEED_CODE_JOBS: CodeJob[] = [
  {
    id: 'job_code_rbac_104',
    organizationId: 'org_anstat_01',
    repositoryId: 'repo_northstar_web_01',
    repositoryName: 'northstar-web-platform',
    branch: 'main',
    featureBranch: 'anstat/autofix-rbac-guard-104',
    issue: {
      issueNumber: 104,
      title: 'Add Role-Based Permission Guard to Admin Route Handler',
      description: 'Wrap protected admin mutation routes in checkPermission authorization boundary.',
      acceptanceCriteria: ['Sub-10ms permission check', '403 Forbidden on unauthorized role'],
    },
    status: 'needs_review',
    progress: 90,
    modelId: 'claude-3-5-sonnet',
    validationLevel: 'standard',
    securityLevel: 'strict',
    context: {
      repositoryId: 'repo_northstar_web_01',
      repositoryName: 'northstar-web-platform',
      branch: 'main',
      selectedFiles: ['lib/auth/rbac-guard.ts', 'app/api/admin/users/route.ts'],
      excludedFiles: ['node_modules/', '.next/'],
      estimatedTokens: 42800,
      dependencies: ['next', 'zod'],
      symbols: ['checkPermission', 'UserRole'],
    },
    plan: {
      id: 'plan_104',
      summary: 'Implementation plan for RBAC guard',
      steps: [
        { id: '1', title: 'Define Permission Types', description: 'Add UserRole enum', affectedFiles: ['lib/types/permissions.ts'], status: 'completed', order: 1 },
        { id: '2', title: 'Implement RBAC Helper', description: 'Create checkPermission guard', affectedFiles: ['lib/auth/rbac-guard.ts'], status: 'completed', order: 2 },
      ],
      isApproved: true,
      createdAt: '2026-02-09T19:28:00Z',
    },
    patch: {
      id: 'patch_104',
      filesChangedCount: 3,
      additions: 142,
      deletions: 18,
      fileDiffs: [
        {
          id: 'fd_1',
          file: 'lib/auth/rbac-guard.ts',
          status: 'added',
          additions: 68,
          deletions: 0,
          aiExplanation: 'Adds permission guard helper validating JWT claims.',
          riskLevel: 'low',
          confidenceScore: 98,
          chunks: [
            {
              oldStart: 0,
              oldLines: 0,
              newStart: 1,
              newLines: 6,
              lines: [
                '+ import { getAuthState } from "@/lib/services/registry";',
                '+ export async function checkPermission(role: string): Promise<boolean> {',
                '+   const auth = await getAuthState();',
                '+   return auth.isAuthenticated && auth.user?.role === role;',
                '+ }',
              ],
            },
          ],
        },
      ],
      createdAt: '2026-02-09T19:29:00Z',
    },
    validation: {
      status: 'passed',
      totalChecks: 4,
      passedChecks: 4,
      failedChecks: 0,
      checks: [
        { id: '1', type: 'typecheck', name: 'TypeScript (`tsc`)', status: 'passed', durationMs: 2300 },
        { id: '2', type: 'lint', name: 'ESLint Check', status: 'passed', durationMs: 1400 },
        { id: '3', type: 'unit_tests', name: 'Jest Unit Tests (14 passed)', status: 'passed', durationMs: 4200 },
        { id: '4', type: 'build', name: 'Next.js Build Check', status: 'passed', durationMs: 3800 },
      ],
    },
    securityFindings: [],
    reviewStatus: 'pending',
    reviewComments: [],
    logs: [
      { id: 'l1', timestamp: '19:28:00', stage: 'context', message: 'Analyzed repository context (42,800 tokens)', severity: 'info' },
      { id: 'l2', timestamp: '19:28:15', stage: 'planner', message: 'AI Plan generated and approved by engineer', severity: 'info' },
      { id: 'l3', timestamp: '19:29:00', stage: 'generator', message: 'Patch created: 3 files changed (+142 -18)', severity: 'success' },
      { id: 'l4', timestamp: '19:29:45', stage: 'validator', message: 'Validation suite passed (4/4 checks clean)', severity: 'success' },
    ],
    attempts: 1,
    estimatedCostUsd: 0.35,
    createdByUserId: 'user_shishir_01',
    createdByName: 'Shishir Kumar',
    createdAt: '2026-02-09T19:28:00Z',
    updatedAt: '2026-02-09T19:30:00Z',
  },
];

export class MockCodeService implements CodeService {
  private jobs: CodeJob[] = [...SEED_CODE_JOBS];
  private aiService = new MockAIService();
  private validationService = new MockValidationService();

  async listJobs(params?: CodeJobFilters): Promise<PaginatedResult<CodeJob>> {
    let filtered = [...this.jobs];

    if (params?.status) {
      filtered = filtered.filter(j => j.status === params.status);
    }
    if (params?.repositoryId) {
      filtered = filtered.filter(j => j.repositoryId === params.repositoryId);
    }
    if (params?.query) {
      const q = params.query.toLowerCase();
      filtered = filtered.filter(j => j.issue.title.toLowerCase().includes(q) || j.repositoryName.toLowerCase().includes(q));
    }

    filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

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

  async getJob(id: string): Promise<CodeJob | null> {
    return this.jobs.find(j => j.id === id) || null;
  }

  async createJob(input: CreateCodeJobInput): Promise<CodeJob> {
    const context = await this.aiService.analyzeContext(input.repositoryId, input.issue);
    const plan = await this.aiService.generatePlan(input.issue, context, input.modelId);
    const patch = await this.aiService.generatePatch(plan, context, input.modelId);
    const validation = await this.validationService.runAll('new_job');

    const newJob: CodeJob = {
      id: `job_code_${Date.now()}`,
      organizationId: 'org_anstat_01',
      repositoryId: input.repositoryId,
      repositoryName: input.repositoryName || 'northstar-web-platform',
      branch: 'main',
      featureBranch: `anstat/patch-${Date.now().toString().slice(-4)}`,
      issue: input.issue,
      status: 'needs_review',
      progress: 90,
      modelId: input.modelId,
      validationLevel: input.validationLevel,
      securityLevel: input.securityLevel,
      context,
      plan,
      patch,
      validation,
      securityFindings: [],
      reviewStatus: 'pending',
      reviewComments: [],
      logs: [
        { id: '1', timestamp: new Date().toLocaleTimeString(), stage: 'queued', message: 'Job initialized and queued', severity: 'info' },
        { id: '2', timestamp: new Date().toLocaleTimeString(), stage: 'context', message: 'Repository context analyzed', severity: 'info' },
        { id: '3', timestamp: new Date().toLocaleTimeString(), stage: 'patch', message: 'Patch diff generated', severity: 'success' },
      ],
      attempts: 1,
      estimatedCostUsd: 0.42,
      createdByUserId: 'user_shishir_01',
      createdByName: 'Shishir Kumar',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.jobs.unshift(newJob);
    return newJob;
  }

  async buildContext(jobId: string): Promise<CodeJob> {
    const job = await this.getJob(jobId);
    if (!job) throw new Error('Job not found');
    job.status = 'analyzing';
    job.progress = 25;
    job.updatedAt = new Date().toISOString();
    return job;
  }

  async generatePlan(jobId: string): Promise<CodeJob> {
    const job = await this.getJob(jobId);
    if (!job) throw new Error('Job not found');
    job.status = 'planning';
    job.progress = 50;
    job.plan = await this.aiService.generatePlan(job.issue, job.context, job.modelId);
    job.updatedAt = new Date().toISOString();
    return job;
  }

  async approvePlan(jobId: string): Promise<CodeJob> {
    const job = await this.getJob(jobId);
    if (!job) throw new Error('Job not found');
    if (job.plan) job.plan.isApproved = true;
    job.status = 'generating';
    job.progress = 75;
    job.updatedAt = new Date().toISOString();
    return job;
  }

  async requestPlanChanges(jobId: string, feedback: string): Promise<CodeJob> {
    const job = await this.getJob(jobId);
    if (!job) throw new Error('Job not found');
    if (job.plan) {
      job.plan.userFeedback = feedback;
      job.plan.isApproved = false;
    }
    job.status = 'planning';
    job.progress = 40;
    job.updatedAt = new Date().toISOString();
    return job;
  }

  async generatePatch(jobId: string): Promise<CodeJob> {
    const job = await this.getJob(jobId);
    if (!job) throw new Error('Job not found');
    job.status = 'validating';
    job.progress = 85;
    job.patch = await this.aiService.generatePatch(job.plan!, job.context, job.modelId);
    job.updatedAt = new Date().toISOString();
    return job;
  }

  async validate(jobId: string): Promise<CodeJob> {
    const job = await this.getJob(jobId);
    if (!job) throw new Error('Job not found');
    job.validation = await this.validationService.runAll(jobId);
    job.status = 'needs_review';
    job.progress = 90;
    job.updatedAt = new Date().toISOString();
    return job;
  }

  async runSecurityScan(jobId: string): Promise<CodeJob> {
    const job = await this.getJob(jobId);
    if (!job) throw new Error('Job not found');
    job.securityFindings = [];
    job.updatedAt = new Date().toISOString();
    return job;
  }

  async createPullRequest(jobId: string): Promise<CodeJob> {
    const job = await this.getJob(jobId);
    if (!job) throw new Error('Job not found');
    const prSummary = await this.aiService.summarizePullRequest(job.patch!, job.issue);
    job.pullRequest = {
      id: `pr_${Date.now()}`,
      organizationId: 'org_anstat_01',
      repositoryId: job.repositoryId,
      repositoryName: job.repositoryName,
      number: 105,
      title: prSummary.title,
      body: prSummary.body,
      headBranch: job.featureBranch,
      baseBranch: job.branch,
      status: 'open',
      author: 'anstat-bot[bot]',
      isAiGenerated: true,
      aiJobId: job.id,
      additions: job.patch?.additions || 0,
      deletions: job.patch?.deletions || 0,
      changedFiles: job.patch?.filesChangedCount || 0,
      checksState: 'passed',
      htmlUrl: `https://github.com/northstar-studio/${job.repositoryName}/pull/105`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    job.status = 'completed';
    job.progress = 100;
    job.updatedAt = new Date().toISOString();
    return job;
  }

  async cancelJob(jobId: string): Promise<CodeJob> {
    const job = await this.getJob(jobId);
    if (!job) throw new Error('Job not found');
    job.status = 'cancelled';
    job.updatedAt = new Date().toISOString();
    return job;
  }

  async retryJob(jobId: string): Promise<CodeJob> {
    const job = await this.getJob(jobId);
    if (!job) throw new Error('Job not found');
    job.attempts += 1;
    job.status = 'analyzing';
    job.progress = 20;
    job.updatedAt = new Date().toISOString();
    return job;
  }
}
