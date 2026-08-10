import { BaseEntity } from './common';

export type JobType = 'proposal_generation' | 'code_generation' | 'security_scan' | 'debugging' | 'deployment' | 'autofix';

export type JobStatus =
  | 'queued'
  | 'running'
  | 'processing'
  | 'analyzing'
  | 'planning'
  | 'generating'
  | 'validating'
  | 'scanning'
  | 'needs_review'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'blocked';

export interface JobStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  details?: string;
  error?: string;
}

export interface JobEvent {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  metadata?: Record<string, unknown>;
}

export interface Job extends BaseEntity {
  type: JobType;
  title: string;
  status: JobStatus;
  progress: number; // 0 - 100
  repositoryId?: string;
  repositoryName?: string;
  proposalId?: string;
  modelId?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  estimatedTokenCount?: number;
  estimatedCostUsd?: number;
  steps: JobStep[];
  events: JobEvent[];
  createdByUserId: string;
  createdByName: string;
}
