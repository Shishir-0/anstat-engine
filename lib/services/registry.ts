import { AuthService } from './interfaces/auth.service';
import { ProposalService } from './interfaces/proposal.service';
import { ClientService } from './interfaces/client.service';
import { CodeService } from './interfaces/code.service';
import { ValidationService } from './interfaces/validation.service';
import { AIService } from './interfaces/ai.service';
import { SecurityService } from './interfaces/security.service';
import { GitHubService } from './interfaces/github.service';
import { JobsService } from './interfaces/jobs.service';
import { DeploymentService } from './interfaces/deployment.service';
import { UsageService } from './interfaces/usage.service';
import { AuditService } from './interfaces/audit.service';

import { MockAuthService } from './mock/mock-auth.service';
import { MockProposalService } from './mock/mock-proposal.service';
import { MockClientService } from './mock/mock-client.service';
import { MockCodeService } from './mock/mock-code.service';
import { MockValidationService } from './mock/mock-validation.service';
import { MockAIService } from './mock/mock-ai.service';
import { MockSecurityService } from './mock/mock-security.service';
import { MockGitHubService } from './mock/mock-github.service';
import { MockJobsService } from './mock/mock-jobs.service';
import { MockDeploymentService } from './mock/mock-deployment.service';
import { MockUsageService } from './mock/mock-usage.service';
import { MockAuditService } from './mock/mock-audit.service';

class ServiceRegistry {
  private authService?: AuthService;
  private proposalService?: ProposalService;
  private clientService?: ClientService;
  private codeService?: CodeService;
  private validationService?: ValidationService;
  private aiService?: AIService;
  private securityService?: SecurityService;
  private githubService?: GitHubService;
  private jobsService?: JobsService;
  private deploymentService?: DeploymentService;
  private usageService?: UsageService;
  private auditService?: AuditService;

  getAuthService(): AuthService {
    if (!this.authService) this.authService = new MockAuthService();
    return this.authService;
  }

  getProposalService(): ProposalService {
    if (!this.proposalService) this.proposalService = new MockProposalService();
    return this.proposalService;
  }

  getClientService(): ClientService {
    if (!this.clientService) this.clientService = new MockClientService();
    return this.clientService;
  }

  getCodeService(): CodeService {
    if (!this.codeService) this.codeService = new MockCodeService();
    return this.codeService;
  }

  getValidationService(): ValidationService {
    if (!this.validationService) this.validationService = new MockValidationService();
    return this.validationService;
  }

  getAIService(): AIService {
    if (!this.aiService) this.aiService = new MockAIService();
    return this.aiService;
  }

  getSecurityService(): SecurityService {
    if (!this.securityService) this.securityService = new MockSecurityService();
    return this.securityService;
  }

  getGitHubService(): GitHubService {
    if (!this.githubService) this.githubService = new MockGitHubService();
    return this.githubService;
  }

  getJobsService(): JobsService {
    if (!this.jobsService) this.jobsService = new MockJobsService();
    return this.jobsService;
  }

  getDeploymentService(): DeploymentService {
    if (!this.deploymentService) this.deploymentService = new MockDeploymentService();
    return this.deploymentService;
  }

  getUsageService(): UsageService {
    if (!this.usageService) this.usageService = new MockUsageService();
    return this.usageService;
  }

  getAuditService(): AuditService {
    if (!this.auditService) this.auditService = new MockAuditService();
    return this.auditService;
  }

  getDebuggingService(): any {
    return {
      listSessions: async () => ({ data: [], total: 0 }),
      getSession: async () => null,
    };
  }
}

export const registry = new ServiceRegistry();

export const getAuthService = () => registry.getAuthService();
export const getProposalService = () => registry.getProposalService();
export const getClientService = () => registry.getClientService();
export const getCodeService = () => registry.getCodeService();
export const getValidationService = () => registry.getValidationService();
export const getAIService = () => registry.getAIService();
export const getSecurityService = () => registry.getSecurityService();
export const getGitHubService = () => registry.getGitHubService();
export const getJobsService = () => registry.getJobsService();
export const getDeploymentService = () => registry.getDeploymentService();
export const getUsageService = () => registry.getUsageService();
export const getAuditService = () => registry.getAuditService();
export const getDebuggingService = () => registry.getDebuggingService();

export async function getAuthState() {
  return registry.getAuthService().getAuthState();
}
