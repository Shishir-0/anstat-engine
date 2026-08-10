import { Repository, PullRequest, Branch, Issue } from '../../types/github';
import { PaginatedResult, PaginationParams } from '../../types/common';

export interface GitHubService {
  getConnectionStatus(): Promise<{ isConnected: boolean; orgName?: string; installedAt?: string }>;
  connect(orgName: string): Promise<{ success: boolean }>;
  disconnect(): Promise<{ success: boolean }>;
  listRepositories(params?: PaginationParams): Promise<PaginatedResult<Repository>>;
  getRepositoryById(id: string): Promise<Repository | null>;
  listPullRequests(params?: PaginationParams & { repositoryId?: string }): Promise<PaginatedResult<PullRequest>>;
  listBranches(repositoryId: string): Promise<Branch[]>;
  listIssues(repositoryId: string): Promise<Issue[]>;
}
