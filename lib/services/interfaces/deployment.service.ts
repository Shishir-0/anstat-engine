import { Deployment, DeploymentEnvironment } from '../../types/deployment';
import { PaginatedResult, PaginationParams } from '../../types/common';

export interface DeploymentService {
  listDeployments(params?: PaginationParams & { environment?: DeploymentEnvironment; repositoryId?: string }): Promise<PaginatedResult<Deployment>>;
  getById(id: string): Promise<Deployment | null>;
  triggerDeployment(repositoryId: string, branch: string, environment: DeploymentEnvironment): Promise<Deployment>;
  getLogs(deploymentId: string): Promise<string[]>;
  cancelDeployment(id: string): Promise<boolean>;
}
