import { BaseEntity } from './common';

export type DeploymentEnvironment = 'development' | 'staging' | 'production';

export type DeploymentStatus = 'queued' | 'building' | 'testing' | 'scanning' | 'deploying' | 'passed' | 'failed' | 'cancelled';

export interface DeploymentPipelineStage {
  id: string;
  name: 'Code Sync' | 'Build' | 'Test Suite' | 'Security Check' | 'Deploy' | 'Health Check';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  durationMs?: number;
  logs?: string[];
}

export interface Deployment extends BaseEntity {
  repositoryId: string;
  repositoryName: string;
  commitHash: string;
  commitMessage: string;
  branch: string;
  environment: DeploymentEnvironment;
  status: DeploymentStatus;
  stages: DeploymentPipelineStage[];
  deployedBy: string;
  deployedAt?: string;
  durationMs?: number;
  previewUrl?: string;
  healthStatus: 'healthy' | 'degraded' | 'down' | 'unknown';
  isSimulated: boolean;
}
