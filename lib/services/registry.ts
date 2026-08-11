import { AuthService } from './interfaces/auth.service';
import { ProposalService } from './interfaces/proposal.service';
import { ClientService } from './interfaces/client.service';
import { CodeService } from './interfaces/code.service';
import { ValidationService } from './interfaces/validation.service';
import { SecurityService } from './interfaces/security.service';
import { DebuggingService } from './interfaces/debugging.service';
import { GitHubService } from './interfaces/github.service';
import { AIService } from './interfaces/ai.service';
import { AIProviderService } from './interfaces/ai-provider.service';
import { JobsService } from './interfaces/jobs.service';
import { DeploymentService } from './interfaces/deployment.service';
import { AuditService } from './interfaces/audit.service';
import { UsageService } from './interfaces/usage.service';
import { EntitlementService } from './interfaces/entitlement.service';

import { MockAuthService } from './mock/mock-auth.service';
import { SupabaseAuthService } from './supabase/supabase-auth.service';
import { MockProposalService } from './mock/mock-proposal.service';
import { MockClientService } from './mock/mock-client.service';
import { MockCodeService } from './mock/mock-code.service';
import { MockValidationService } from './mock/mock-validation.service';
import { MockSecurityService } from './mock/mock-security.service';
import { MockDebuggingService } from './mock/mock-debugging.service';
import { MockGitHubService } from './mock/mock-github.service';
import { MockAIService } from './mock/mock-ai.service';
import { AIGatewayService } from './ai/ai-gateway';
import { MockJobsService } from './mock/mock-jobs.service';
import { MockDeploymentService } from './mock/mock-deployment.service';
import { MockAuditService } from './mock/mock-audit.service';
import { MockUsageService } from './mock/mock-usage.service';
import { MockEntitlementService } from './mock/mock-entitlement.service';
import { SupabaseEntitlementService } from './supabase/supabase-entitlement.service';

const useSupabase = process.env.NEXT_PUBLIC_USE_MOCK_AUTH !== 'true' && !!process.env.NEXT_PUBLIC_SUPABASE_URL;

class ServiceRegistry {
  private authService: AuthService = useSupabase ? new SupabaseAuthService() : new MockAuthService();
  private proposalService: ProposalService = new MockProposalService();
  private clientService: ClientService = new MockClientService();
  private codeService: CodeService = new MockCodeService();
  private validationService: ValidationService = new MockValidationService();
  private securityService: SecurityService = new MockSecurityService();
  private debuggingService: DebuggingService = new MockDebuggingService();
  private githubService: GitHubService = new MockGitHubService();
  private aiService: AIService = new MockAIService();
  private entitlementService: EntitlementService = useSupabase ? new SupabaseEntitlementService() : new MockEntitlementService();
  private aiGatewayService: AIProviderService = new AIGatewayService(undefined, this.entitlementService);
  private jobsService: JobsService = new MockJobsService();
  private deploymentService: DeploymentService = new MockDeploymentService();
  private auditService: AuditService = new MockAuditService();
  private usageService: UsageService = new MockUsageService();

  getAuthService(): AuthService { return this.authService; }
  getProposalService(): ProposalService { return this.proposalService; }
  getClientService(): ClientService { return this.clientService; }
  getCodeService(): CodeService { return this.codeService; }
  getValidationService(): ValidationService { return this.validationService; }
  getSecurityService(): SecurityService { return this.securityService; }
  getDebuggingService(): DebuggingService { return this.debuggingService; }
  getGitHubService(): GitHubService { return this.githubService; }
  getAIService(): AIService { return this.aiService; }
  getAIGatewayService(): AIProviderService { return this.aiGatewayService; }
  getJobsService(): JobsService { return this.jobsService; }
  getDeploymentService(): DeploymentService { return this.deploymentService; }
  getAuditService(): AuditService { return this.auditService; }
  getUsageService(): UsageService { return this.usageService; }
  getEntitlementService(): EntitlementService { return this.entitlementService; }
}

export const registry = new ServiceRegistry();

export function getAuthService(): AuthService { return registry.getAuthService(); }
export function getProposalService(): ProposalService { return registry.getProposalService(); }
export function getClientService(): ClientService { return registry.getClientService(); }
export function getCodeService(): CodeService { return registry.getCodeService(); }
export function getValidationService(): ValidationService { return registry.getValidationService(); }
export function getSecurityService(): SecurityService { return registry.getSecurityService(); }
export function getDebuggingService(): DebuggingService { return registry.getDebuggingService(); }
export function getGitHubService(): GitHubService { return registry.getGitHubService(); }
export function getAIService(): AIService { return registry.getAIService(); }
export function getAIGatewayService(): AIProviderService { return registry.getAIGatewayService(); }
export function getJobsService(): JobsService { return registry.getJobsService(); }
export function getDeploymentService(): DeploymentService { return registry.getDeploymentService(); }
export function getAuditService(): AuditService { return registry.getAuditService(); }
export function getUsageService(): UsageService { return registry.getUsageService(); }
export function getEntitlementService(): EntitlementService { return registry.getEntitlementService(); }
