import {
  EntitlementCheckResult,
  EntitlementResource,
  PlanLimits,
  SubscriptionDetails,
  UsageSummary,
} from '../../types/entitlement';

export interface EntitlementService {
  getSubscription(organizationId?: string): Promise<SubscriptionDetails | null>;
  getPlan(planCode?: string): Promise<PlanLimits>;
  getUsageSummary(organizationId?: string): Promise<UsageSummary>;
  getRemainingQuota(resource: EntitlementResource, organizationId?: string): Promise<number>;

  canCreateProposal(organizationId?: string): Promise<EntitlementCheckResult>;
  canCreateCodeJob(organizationId?: string): Promise<EntitlementCheckResult>;
  canRunSecurityScan(organizationId?: string): Promise<EntitlementCheckResult>;
  canCreateRepository(organizationId?: string): Promise<EntitlementCheckResult>;
  canAddSeat(organizationId?: string): Promise<EntitlementCheckResult>;
  canUseAI(creditsRequired?: number, organizationId?: string): Promise<EntitlementCheckResult>;

  consumeProposal(organizationId?: string): Promise<EntitlementCheckResult>;
  consumeCodeJob(organizationId?: string): Promise<EntitlementCheckResult>;
  consumeSecurityScan(organizationId?: string): Promise<EntitlementCheckResult>;
  consumeRepository(organizationId?: string): Promise<EntitlementCheckResult>;
  consumeSeat(organizationId?: string): Promise<EntitlementCheckResult>;
  consumeAICredits(amount: number, organizationId?: string): Promise<EntitlementCheckResult>;
}
