import { BaseEntity } from './common';

export interface Repository extends BaseEntity {
  name: string;
  fullName: string;
  owner: string;
  description?: string;
  defaultBranch: string;
  isPrivate: boolean;
  language: string;
  stargazersCount: number;
  openIssuesCount: number;
  securityScore: number;
  lastScannedAt?: string;
  connectedAt: string;
  status: 'active' | 'syncing' | 'error';
}

export interface PullRequest extends BaseEntity {
  repositoryId: string;
  repositoryName: string;
  number: number;
  title: string;
  body: string;
  headBranch: string;
  baseBranch: string;
  status: 'open' | 'merged' | 'closed';
  author: string;
  isAiGenerated: boolean;
  aiJobId?: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  checksState: 'passed' | 'failed' | 'pending';
  htmlUrl: string;
}

export interface Branch {
  name: string;
  commitHash: string;
  isDefault: boolean;
  protected: boolean;
}

export interface Issue {
  id: string;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  author: string;
  createdAt: string;
}
