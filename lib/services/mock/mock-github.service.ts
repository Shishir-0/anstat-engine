import { GitHubService } from '../interfaces/github.service';
import { Repository, PullRequest, Branch, Issue } from '../../types/github';
import { PaginatedResult, PaginationParams } from '../../types/common';
import { MOCK_REPOSITORIES, MOCK_PULL_REQUESTS } from '../../mock/seed-data';

export class MockGitHubService implements GitHubService {
  private repos: Repository[] = [...MOCK_REPOSITORIES];
  private prs: PullRequest[] = [...MOCK_PULL_REQUESTS];
  private isConnected = true;

  async getConnectionStatus(): Promise<{ isConnected: boolean; orgName?: string; installedAt?: string }> {
    return {
      isConnected: this.isConnected,
      orgName: 'northstar-studio',
      installedAt: '2025-01-20T00:00:00Z',
    };
  }

  async connect(orgName: string): Promise<{ success: boolean }> {
    this.isConnected = true;
    return { success: true };
  }

  async disconnect(): Promise<{ success: boolean }> {
    this.isConnected = false;
    return { success: true };
  }

  async listRepositories(params?: PaginationParams): Promise<PaginatedResult<Repository>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;

    return {
      data: this.repos.slice(start, start + limit),
      total: this.repos.length,
      page,
      limit,
      totalPages: Math.ceil(this.repos.length / limit) || 1,
    };
  }

  async getRepositoryById(id: string): Promise<Repository | null> {
    return this.repos.find(r => r.id === id) || null;
  }

  async listPullRequests(params?: PaginationParams & { repositoryId?: string }): Promise<PaginatedResult<PullRequest>> {
    let filtered = [...this.prs];
    if (params?.repositoryId) {
      filtered = filtered.filter(p => p.repositoryId === params.repositoryId);
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

  async listBranches(repositoryId: string): Promise<Branch[]> {
    return [
      { name: 'main', commitHash: 'a8f910c', isDefault: true, protected: true },
      { name: 'staging', commitHash: '7c4b2e1', isDefault: false, protected: false },
      { name: 'anstat/autofix-rbac-guard-104', commitHash: 'b9e4a1f', isDefault: false, protected: false },
    ];
  }

  async listIssues(repositoryId: string): Promise<Issue[]> {
    return [
      {
        id: 'iss_01',
        number: 42,
        title: 'Add role-based access control to the admin dashboard',
        body: 'Admin API routes need authorization middleware guard.',
        state: 'open',
        author: 'sarah-j',
        createdAt: '2026-02-08T10:00:00Z',
      },
      {
        id: 'iss_02',
        number: 45,
        title: 'Fix price rounding issue on checkout total calculation',
        body: 'Floating point rounding error observed on multi-item orders.',
        state: 'open',
        author: 'marcus-v',
        createdAt: '2026-02-09T11:30:00Z',
      },
    ];
  }
}
