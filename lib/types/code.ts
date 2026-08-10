import { BaseEntity } from './common';
import { JobStatus, JobStep } from './job';
import { SecurityFinding } from './security';
import { PullRequest } from './github';

export type ValidationCheckType = 'typecheck' | 'lint' | 'unit_tests' | 'integration_tests' | 'build';
export type ValidationCheckStatus = 'queued' | 'running' | 'passed' | 'failed' | 'skipped';

export interface ValidationCheck {
  id: string;
  type: ValidationCheckType;
  name: string;
  status: ValidationCheckStatus;
  durationMs?: number;
  errorMessage?: string;
  fileLocation?: string;
  line?: number;
}

export interface ValidationResult {
  status: 'passed' | 'failed' | 'running' | 'queued';
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  checks: ValidationCheck[];
}

export interface FileDiffChunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[];
}

export interface FileDiff {
  id: string;
  file: string;
  oldPath?: string;
  newPath?: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  aiExplanation: string;
  riskLevel: 'low' | 'medium' | 'high';
  confidenceScore: number;
  chunks: FileDiffChunk[];
}

export interface CodePatch {
  id: string;
  filesChangedCount: number;
  additions: number;
  deletions: number;
  fileDiffs: FileDiff[];
  createdAt: string;
}

export interface CodePlanStep {
  id: string;
  title: string;
  description: string;
  affectedFiles: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  order: number;
}

export interface CodePlan {
  id: string;
  summary: string;
  steps: CodePlanStep[];
  isApproved: boolean;
  userFeedback?: string;
  createdAt: string;
}

export interface CodeRepositoryContext {
  repositoryId: string;
  repositoryName: string;
  branch: string;
  selectedFiles: string[];
  excludedFiles: string[];
  estimatedTokens: number;
  dependencies: string[];
  symbols: string[];
}

export interface CodeIssueContext {
  issueId?: string;
  issueNumber?: number;
  title: string;
  description: string;
  acceptanceCriteria: string[];
}

export interface CodeReviewComment {
  id: string;
  author: string;
  file?: string;
  line?: number;
  comment: string;
  createdAt: string;
}

export interface CodeJobLog {
  id: string;
  timestamp: string;
  stage: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export interface CodeJob extends BaseEntity {
  repositoryId: string;
  repositoryName: string;
  branch: string;
  featureBranch: string;
  issue: CodeIssueContext;
  status: JobStatus;
  progress: number;
  modelId: string;
  validationLevel: 'quick' | 'standard' | 'deep';
  securityLevel: 'standard' | 'strict';
  context: CodeRepositoryContext;
  plan?: CodePlan;
  patch?: CodePatch;
  validation?: ValidationResult;
  securityFindings: SecurityFinding[];
  reviewStatus: 'pending' | 'approved' | 'changes_requested';
  reviewComments: CodeReviewComment[];
  pullRequest?: PullRequest;
  logs: CodeJobLog[];
  attempts: number;
  estimatedCostUsd: number;
  createdByUserId: string;
  createdByName: string;
}
