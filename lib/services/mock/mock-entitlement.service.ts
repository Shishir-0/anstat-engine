import { EntitlementService } from '../interfaces/entitlement.service';
import {
  EntitlementCheckResult,
  EntitlementResource,
  PlanLimits,
  SubscriptionDetails,
  UsageSummary,
} from '../../types/entitlement';

const PLAN_MATRIX: Record<string, PlanLimits> = {
  starter: {
    code: 'starter',
    name: 'Starter',
    priceInrMonthly: 499,
    maxMembers: 2,
    maxRepositories: 3,
    monthlyProposals: 10,
    monthlyCodeJobs: 25,
    monthlySecurityScans: 10,
    monthlyAiCredits: 300,
    githubEnabled: true,
    advancedSecurity: false,
    teamRbac: false,
    priorityWorkers: false,
  },
  pro: {
    code: 'pro',
    name: 'Pro',
    priceInrMonthly: 999,
    maxMembers: 5,
    maxRepositories: 10,
    monthlyProposals: 50,
    monthlyCodeJobs: 100,
    monthlySecurityScans: 50,
    monthlyAiCredits: 1000,
    githubEnabled: true,
    advancedSecurity: true,
    teamRbac: false,
    priorityWorkers: false,
  },
  studio: {
    code: 'studio',
    name: 'Studio',
    priceInrMonthly: 2499,
    maxMembers: 15,
    maxRepositories: 25,
    monthlyProposals: 200,
    monthlyCodeJobs: 500,
    monthlySecurityScans: 250,
    monthlyAiCredits: 3000,
    githubEnabled: true,
    advancedSecurity: true,
    teamRbac: true,
    priorityWorkers: true,
  },
  business: {
    code: 'business',
    name: 'Business',
    priceInrMonthly: 5999,
    maxMembers: 999,
    maxRepositories: 999,
    monthlyProposals: 99999,
    monthlyCodeJobs: 99999,
    monthlySecurityScans: 99999,
    monthlyAiCredits: 10000,
    githubEnabled: true,
    advancedSecurity: true,
    teamRbac: true,
    priorityWorkers: true,
  },
};

interface MockUsageCounts {
  seats: number;
  repositories: number;
  proposals: number;
  codeJobs: number;
  securityScans: number;
  aiCredits: number;
}

export class MockEntitlementService implements EntitlementService {
  private currentPlanCode: string = 'starter';
  private subscriptionStatus: 'trialing' | 'active' | 'past_due' | 'grace_period' | 'expired' | 'cancelled' = 'active';
  private usage: MockUsageCounts = {
    seats: 1,
    repositories: 2,
    proposals: 7,
    codeJobs: 18,
    securityScans: 4,
    aiCredits: 125,
  };

  public setMockState(state: {
    planCode?: string;
    status?: 'trialing' | 'active' | 'past_due' | 'grace_period' | 'expired' | 'cancelled';
    used?: Partial<MockUsageCounts>;
  }) {
    this.currentPlanCode = state.planCode || 'starter';
    this.subscriptionStatus = state.status || 'active';
    this.usage = {
      seats: 1,
      repositories: 2,
      proposals: 0,
      codeJobs: 0,
      securityScans: 0,
      aiCredits: 0,
      ...state.used,
    };
  }

  async getSubscription(_organizationId?: string): Promise<SubscriptionDetails | null> {
    const plan = PLAN_MATRIX[this.currentPlanCode] || PLAN_MATRIX.starter;
    return {
      id: 'sub_mock_001',
      organizationId: _organizationId || 'org_anstat_01',
      planId: `plan_${plan.code}`,
      planCode: plan.code,
      planName: plan.name,
      status: this.subscriptionStatus,
      currentPeriodStart: new Date(Date.now() - 15 * 86400000).toISOString(),
      currentPeriodEnd: new Date(Date.now() + 15 * 86400000).toISOString(),
      cancelAtPeriodEnd: false,
    };
  }

  async getPlan(planCode?: string): Promise<PlanLimits> {
    return PLAN_MATRIX[planCode || this.currentPlanCode] || PLAN_MATRIX.starter;
  }

  async getUsageSummary(organizationId?: string): Promise<UsageSummary> {
    const plan = await this.getPlan();
    const sub = await this.getSubscription(organizationId);

    const safeSeats = isNaN(this.usage.seats) ? 0 : this.usage.seats;
    const safeRepos = isNaN(this.usage.repositories) ? 0 : this.usage.repositories;
    const safeProps = isNaN(this.usage.proposals) ? 0 : this.usage.proposals;
    const safeJobs = isNaN(this.usage.codeJobs) ? 0 : this.usage.codeJobs;
    const safeScans = isNaN(this.usage.securityScans) ? 0 : this.usage.securityScans;
    const safeCredits = isNaN(this.usage.aiCredits) ? 0 : this.usage.aiCredits;

    return {
      organizationId: organizationId || 'org_anstat_01',
      planCode: plan.code,
      planName: plan.name,
      priceInrMonthly: plan.priceInrMonthly,
      subscriptionStatus: sub?.status || 'active',
      limits: {
        seats: plan.maxMembers,
        repositories: plan.maxRepositories,
        proposals: plan.monthlyProposals,
        codeJobs: plan.monthlyCodeJobs,
        securityScans: plan.monthlySecurityScans,
        aiCredits: plan.monthlyAiCredits,
      },
      used: {
        seats: safeSeats,
        repositories: safeRepos,
        proposals: safeProps,
        codeJobs: safeJobs,
        securityScans: safeScans,
        aiCredits: safeCredits,
      },
      remaining: {
        seats: Math.max(0, plan.maxMembers - safeSeats),
        repositories: Math.max(0, plan.maxRepositories - safeRepos),
        proposals: Math.max(0, plan.monthlyProposals - safeProps),
        codeJobs: Math.max(0, plan.monthlyCodeJobs - safeJobs),
        securityScans: Math.max(0, plan.monthlySecurityScans - safeScans),
        aiCredits: Math.max(0, plan.monthlyAiCredits - safeCredits),
      },
    };
  }

  async getRemainingQuota(resource: EntitlementResource, organizationId?: string): Promise<number> {
    const summary = await this.getUsageSummary(organizationId);
    switch (resource) {
      case 'seats': return summary.remaining.seats;
      case 'repositories': return summary.remaining.repositories;
      case 'proposals': return summary.remaining.proposals;
      case 'code_jobs': return summary.remaining.codeJobs;
      case 'security_scans': return summary.remaining.securityScans;
      case 'ai_credits': return summary.remaining.aiCredits;
    }
  }

  async canCreateProposal(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.evaluateCheck('proposals', 1, organizationId);
  }

  async canCreateCodeJob(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.evaluateCheck('code_jobs', 1, organizationId);
  }

  async canRunSecurityScan(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.evaluateCheck('security_scans', 1, organizationId);
  }

  async canCreateRepository(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.evaluateCheck('repositories', 1, organizationId);
  }

  async canAddSeat(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.evaluateCheck('seats', 1, organizationId);
  }

  async canUseAI(creditsRequired: number = 1, organizationId?: string): Promise<EntitlementCheckResult> {
    return this.evaluateCheck('ai_credits', creditsRequired, organizationId);
  }

  async consumeProposal(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.atomicConsume('proposals', 1, organizationId);
  }

  async consumeCodeJob(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.atomicConsume('code_jobs', 1, organizationId);
  }

  async consumeSecurityScan(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.atomicConsume('security_scans', 1, organizationId);
  }

  async consumeRepository(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.atomicConsume('repositories', 1, organizationId);
  }

  async consumeSeat(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.atomicConsume('seats', 1, organizationId);
  }

  async consumeAICredits(amount: number, organizationId?: string): Promise<EntitlementCheckResult> {
    return this.atomicConsume('ai_credits', amount, organizationId);
  }

  private async evaluateCheck(resource: EntitlementResource, amount: number, organizationId?: string): Promise<EntitlementCheckResult> {
    const summary = await this.getUsageSummary(organizationId);

    if (this.subscriptionStatus === 'expired' || this.subscriptionStatus === 'cancelled') {
      return {
        allowed: false,
        resource,
        used: summary.used[this.getResourceKey(resource)],
        limit: summary.limits[this.getResourceKey(resource)],
        remaining: summary.remaining[this.getResourceKey(resource)],
        reason: 'SUBSCRIPTION_EXPIRED',
        message: 'Workspace subscription is expired or cancelled.',
      };
    }

    const key = this.getResourceKey(resource);
    const used = summary.used[key];
    const limit = summary.limits[key];
    const remaining = summary.remaining[key];

    if (used + amount > limit) {
      const reason = resource === 'ai_credits' ? 'AI_CREDIT_LIMIT_REACHED' : 'RESOURCE_LIMIT_REACHED';
      return {
        allowed: false,
        resource,
        used,
        limit,
        remaining,
        reason,
        message: `Quota limit reached for ${resource}. Limit: ${limit}, Used: ${used}.`,
      };
    }

    return {
      allowed: true,
      resource,
      used,
      limit,
      remaining: remaining - amount,
      reason: null,
      message: 'Operation allowed by entitlement engine.',
    };
  }

  private async atomicConsume(resource: EntitlementResource, amount: number, organizationId?: string): Promise<EntitlementCheckResult> {
    const key = this.getResourceKey(resource);
    const summary = await this.getUsageSummary(organizationId);
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return {
        allowed: false,
        resource,
        used: summary.used[key],
        limit: summary.limits[key],
        remaining: summary.remaining[key],
        reason: 'INVALID_AMOUNT',
        message: 'Consumption amount must be a positive integer.',
      };
    }

    if (this.subscriptionStatus === 'expired' || this.subscriptionStatus === 'cancelled') {
      return {
        allowed: false,
        resource,
        used: summary.used[key],
        limit: summary.limits[key],
        remaining: summary.remaining[key],
        reason: 'SUBSCRIPTION_EXPIRED',
        message: 'Workspace subscription is expired or cancelled.',
      };
    }

    const limit = summary.limits[key];
    const currentUsed = isNaN(this.usage[key]) ? 0 : this.usage[key];

    // Atomic boundary check
    if (currentUsed + numAmount > limit) {
      const reason = resource === 'ai_credits' ? 'AI_CREDIT_LIMIT_REACHED' : 'RESOURCE_LIMIT_REACHED';
      return {
        allowed: false,
        resource,
        used: currentUsed,
        limit,
        remaining: Math.max(0, limit - currentUsed),
        reason,
        message: `Quota limit reached for ${resource}. Limit: ${limit}, Used: ${currentUsed}.`,
      };
    }

    // Atomic increment
    this.usage[key] = currentUsed + numAmount;
    const newUsed = this.usage[key];

    return {
      allowed: true,
      resource,
      used: newUsed,
      limit,
      remaining: Math.max(0, limit - newUsed),
      reason: null,
      message: 'Quota successfully consumed.',
    };
  }

  private getResourceKey(resource: EntitlementResource): 'seats' | 'repositories' | 'proposals' | 'codeJobs' | 'securityScans' | 'aiCredits' {
    switch (resource) {
      case 'seats': return 'seats';
      case 'repositories': return 'repositories';
      case 'proposals': return 'proposals';
      case 'code_jobs': return 'codeJobs';
      case 'security_scans': return 'securityScans';
      case 'ai_credits': return 'aiCredits';
    }
  }
}
