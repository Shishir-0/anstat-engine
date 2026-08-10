import { DeploymentService } from '../interfaces/deployment.service';
import { Deployment, DeploymentEnvironment } from '../../types/deployment';
import { PaginatedResult, PaginationParams } from '../../types/common';
import { MOCK_DEPLOYMENTS } from '../../mock/seed-data';

export class MockDeploymentService implements DeploymentService {
  private deployments: Deployment[] = [...MOCK_DEPLOYMENTS];

  async listDeployments(params?: PaginationParams & { environment?: DeploymentEnvironment; repositoryId?: string }): Promise<PaginatedResult<Deployment>> {
    let filtered = [...this.deployments];
    if (params?.environment) {
      filtered = filtered.filter(d => d.environment === params.environment);
    }
    if (params?.repositoryId) {
      filtered = filtered.filter(d => d.repositoryId === params.repositoryId);
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

  async getById(id: string): Promise<Deployment | null> {
    return this.deployments.find(d => d.id === id) || null;
  }

  async triggerDeployment(repositoryId: string, branch: string, environment: DeploymentEnvironment): Promise<Deployment> {
    const newDeployment: Deployment = {
      id: `dep_${Date.now()}`,
      organizationId: 'org_anstat_01',
      repositoryId,
      repositoryName: 'northstar-web-platform',
      commitHash: 'e4f901a',
      commitMessage: `Triggered automated deployment to ${environment}`,
      branch,
      environment,
      status: 'passed',
      stages: [
        { id: '1', name: 'Code Sync', status: 'passed', durationMs: 1200 },
        { id: '2', name: 'Build', status: 'passed', durationMs: 18000 },
        { id: '3', name: 'Test Suite', status: 'passed', durationMs: 12000 },
        { id: '4', name: 'Security Check', status: 'passed', durationMs: 6000 },
        { id: '5', name: 'Deploy', status: 'passed', durationMs: 10000 },
        { id: '6', name: 'Health Check', status: 'passed', durationMs: 2000 },
      ],
      deployedBy: 'Shishir Kumar',
      deployedAt: new Date().toISOString(),
      durationMs: 49200,
      previewUrl: `https://${environment}.northstarstudio.dev`,
      healthStatus: 'healthy',
      isSimulated: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.deployments.unshift(newDeployment);
    return newDeployment;
  }

  async getLogs(deploymentId: string): Promise<string[]> {
    return [
      '[17:43:01] INFO  Starting production deployment build pipeline...',
      '[17:43:03] INFO  Pulling repository commit a8f910c (main)',
      '[17:43:08] INFO  Running next build --no-lint',
      '[17:43:24] SUCCESS Compiled Next.js production bundle (14 routes)',
      '[17:43:32] SUCCESS Running unit & integration tests (48 passed, 0 failed)',
      '[17:43:40] SUCCESS Static security scan passed (Risk Score: 18)',
      '[17:43:48] INFO  Syncing build artifacts to Hostinger Node.js target environment',
      '[17:43:52] SUCCESS Node server started on port 3000. Health check HTTP 200 OK.',
    ];
  }

  async cancelDeployment(id: string): Promise<boolean> {
    const deployment = this.deployments.find(d => d.id === id);
    if (deployment) {
      deployment.status = 'cancelled';
      return true;
    }
    return false;
  }
}
