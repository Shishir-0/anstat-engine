export type EntitlementResource =
  | 'seats'
  | 'repositories'
  | 'proposals'
  | 'code_jobs'
  | 'security_scans'
  | 'ai_credits';

export type EntitlementReasonCode =
  | 'SUBSCRIPTION_REQUIRED'
  | 'SUBSCRIPTION_EXPIRED'
  | 'SUBSCRIPTION_PAST_DUE'
  | 'RESOURCE_LIMIT_REACHED'
  | 'AI_CREDIT_LIMIT_REACHED'
  | 'SEAT_LIMIT_REACHED'
  | 'REPOSITORY_LIMIT_REACHED'
  | 'PERMISSION_DENIED'
  | 'ORGANIZATION_NOT_FOUND'
  | 'INVALID_AMOUNT'
  | 'INVALID_RESOURCE';

export interface EntitlementCheckResult {
  allowed: boolean;
  resource: EntitlementResource;
  used: number;
  limit: number;
  remaining: number;
  reason: EntitlementReasonCode | null;
  message?: string;
}

export interface PlanLimits {
  code: 'starter' | 'pro' | 'studio' | 'business';
  name: string;
  priceInrMonthly: number;
  maxMembers: number;
  maxRepositories: number;
  monthlyProposals: number;
  monthlyCodeJobs: number;
  monthlySecurityScans: number;
  monthlyAiCredits: number;
  githubEnabled: boolean;
  advancedSecurity: boolean;
  teamRbac: boolean;
  priorityWorkers: boolean;
}

export interface UsageSummary {
  organizationId: string;
  planCode: string;
  planName: string;
  priceInrMonthly: number;
  subscriptionStatus: 'trialing' | 'active' | 'past_due' | 'grace_period' | 'expired' | 'cancelled';
  limits: {
    seats: number;
    repositories: number;
    proposals: number;
    codeJobs: number;
    securityScans: number;
    aiCredits: number;
  };
  used: {
    seats: number;
    repositories: number;
    proposals: number;
    codeJobs: number;
    securityScans: number;
    aiCredits: number;
  };
  remaining: {
    seats: number;
    repositories: number;
    proposals: number;
    codeJobs: number;
    securityScans: number;
    aiCredits: number;
  };
}

export interface SubscriptionDetails {
  id: string;
  organizationId: string;
  planId: string;
  planCode: string;
  planName: string;
  status: 'trialing' | 'active' | 'past_due' | 'grace_period' | 'expired' | 'cancelled';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}
