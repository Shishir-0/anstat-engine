import { EntitlementService } from '../interfaces/entitlement.service';
import {
  EntitlementCheckResult,
  EntitlementReasonCode,
  EntitlementResource,
  PlanLimits,
  SubscriptionDetails,
  UsageSummary,
} from '../../types/entitlement';
import { createClient } from '../../supabase/client';

interface RawEntitlementRow {
  max_members?: number;
  max_repositories?: number;
  monthly_proposals?: number;
  monthly_code_jobs?: number;
  monthly_security_scans?: number;
  monthly_ai_credits?: number;
  github_enabled?: boolean;
  advanced_security?: boolean;
  team_rbac?: boolean;
  priority_workers?: boolean;
}

interface RawRPCResult {
  allowed?: boolean;
  resource?: string;
  used?: number;
  limit?: number;
  remaining?: number;
  reason?: string | null;
  message?: string;
}

export class SupabaseEntitlementService implements EntitlementService {
  private get supabase() {
    return createClient();
  }

  async getSubscription(organizationId?: string): Promise<SubscriptionDetails | null> {
    try {
      const orgId = organizationId || await this.resolveActiveOrgId();
      if (!orgId) return null;

      const { data, error } = await this.supabase
        .from('subscriptions')
        .select('id, organization_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end, plans(code, name)')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) return null;

      const planData = (data as unknown as { plans: { code: string; name: string } }).plans;

      return {
        id: data.id,
        organizationId: data.organization_id,
        planId: data.plan_id,
        planCode: planData?.code || 'starter',
        planName: planData?.name || 'Starter',
        status: data.status as SubscriptionDetails['status'],
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: data.cancel_at_period_end,
      };
    } catch {
      return null;
    }
  }

  async getPlan(planCode?: string): Promise<PlanLimits> {
    const code = planCode || 'starter';
    const { data } = await this.supabase
      .from('plans')
      .select('code, name, price_inr_monthly, included_ai_credits, entitlements(*)')
      .eq('code', code)
      .maybeSingle();

    if (!data) {
      return {
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
      };
    }

    const ent = (data as unknown as { entitlements: RawEntitlementRow }).entitlements;
    return {
      code: data.code as PlanLimits['code'],
      name: data.name,
      priceInrMonthly: Number(data.price_inr_monthly),
      maxMembers: ent?.max_members || 2,
      maxRepositories: ent?.max_repositories || 3,
      monthlyProposals: ent?.monthly_proposals || 10,
      monthlyCodeJobs: ent?.monthly_code_jobs || 25,
      monthlySecurityScans: ent?.monthly_security_scans || 10,
      monthlyAiCredits: ent?.monthly_ai_credits || 300,
      githubEnabled: ent?.github_enabled ?? true,
      advancedSecurity: ent?.advanced_security ?? false,
      teamRbac: ent?.team_rbac ?? false,
      priorityWorkers: ent?.priority_workers ?? false,
    };
  }

  async getUsageSummary(organizationId?: string): Promise<UsageSummary> {
    const orgId = organizationId || await this.resolveActiveOrgId();
    const sub = await this.getSubscription(orgId);
    const plan = await this.getPlan(sub?.planCode || 'starter');

    let usedProposals = 0;
    let usedCodeJobs = 0;
    let usedSecurityScans = 0;
    let usedAiCredits = 0;
    let usedSeats = 0;
    let usedRepos = 0;

    if (orgId) {
      const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: counter } = await this.supabase
        .from('usage_counters')
        .select('*')
        .eq('organization_id', orgId)
        .gte('billing_period_start', periodStart)
        .maybeSingle();

      if (counter) {
        usedProposals = counter.used_proposals || 0;
        usedCodeJobs = counter.used_code_jobs || 0;
        usedSecurityScans = counter.used_scans || 0;
        usedAiCredits = counter.used_ai_credits || 0;
      }

      const { count: seatsCount } = await this.supabase
        .from('memberships')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);
      usedSeats = seatsCount || 1;

      const { count: reposCount } = await this.supabase
        .from('repositories')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', orgId);
      usedRepos = reposCount || 0;
    }

    return {
      organizationId: orgId || '',
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
        seats: usedSeats,
        repositories: usedRepos,
        proposals: usedProposals,
        codeJobs: usedCodeJobs,
        securityScans: usedSecurityScans,
        aiCredits: usedAiCredits,
      },
      remaining: {
        seats: Math.max(0, plan.maxMembers - usedSeats),
        repositories: Math.max(0, plan.maxRepositories - usedRepos),
        proposals: Math.max(0, plan.monthlyProposals - usedProposals),
        codeJobs: Math.max(0, plan.monthlyCodeJobs - usedCodeJobs),
        securityScans: Math.max(0, plan.monthlySecurityScans - usedSecurityScans),
        aiCredits: Math.max(0, plan.monthlyAiCredits - usedAiCredits),
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
    return this.checkRPC('proposals', 1, organizationId);
  }

  async canCreateCodeJob(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.checkRPC('code_jobs', 1, organizationId);
  }

  async canRunSecurityScan(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.checkRPC('security_scans', 1, organizationId);
  }

  async canCreateRepository(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.checkRPC('repositories', 1, organizationId);
  }

  async canAddSeat(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.checkRPC('seats', 1, organizationId);
  }

  async canUseAI(creditsRequired: number = 1, organizationId?: string): Promise<EntitlementCheckResult> {
    return this.checkRPC('ai_credits', creditsRequired, organizationId);
  }

  async consumeProposal(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.consumeRPC('proposals', 1, organizationId);
  }

  async consumeCodeJob(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.consumeRPC('code_jobs', 1, organizationId);
  }

  async consumeSecurityScan(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.consumeRPC('security_scans', 1, organizationId);
  }

  async consumeRepository(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.consumeRPC('repositories', 1, organizationId);
  }

  async consumeSeat(organizationId?: string): Promise<EntitlementCheckResult> {
    return this.consumeRPC('seats', 1, organizationId);
  }

  async consumeAICredits(amount: number, organizationId?: string): Promise<EntitlementCheckResult> {
    return this.consumeRPC('ai_credits', amount, organizationId);
  }

  private async checkRPC(resource: EntitlementResource, amount: number, organizationId?: string): Promise<EntitlementCheckResult> {
    const orgId = organizationId || await this.resolveActiveOrgId();
    const { data, error } = await this.supabase.rpc('check_quota_atomic', {
      p_org_id: orgId || null,
      p_resource: resource,
      p_amount: amount,
    });

    if (error || !data) {
      return {
        allowed: false,
        resource,
        used: 0,
        limit: 0,
        remaining: 0,
        reason: 'ORGANIZATION_NOT_FOUND',
        message: error?.message || 'Failed to check quota via Supabase RPC.',
      };
    }

    return this.mapRPCResult(data as RawRPCResult);
  }

  private async consumeRPC(resource: EntitlementResource, amount: number, organizationId?: string): Promise<EntitlementCheckResult> {
    const orgId = organizationId || await this.resolveActiveOrgId();
    const { data, error } = await this.supabase.rpc('consume_quota_atomic', {
      p_org_id: orgId || null,
      p_resource: resource,
      p_amount: amount,
    });

    if (error || !data) {
      return {
        allowed: false,
        resource,
        used: 0,
        limit: 0,
        remaining: 0,
        reason: 'ORGANIZATION_NOT_FOUND',
        message: error?.message || 'Failed to consume quota via Supabase RPC.',
      };
    }

    return this.mapRPCResult(data as RawRPCResult);
  }

  private mapRPCResult(raw: RawRPCResult): EntitlementCheckResult {
    return {
      allowed: Boolean(raw.allowed),
      resource: (raw.resource || 'proposals') as EntitlementResource,
      used: Number(raw.used || 0),
      limit: Number(raw.limit || 0),
      remaining: Number(raw.remaining || 0),
      reason: (raw.reason || null) as EntitlementReasonCode | null,
      message: raw.message || undefined,
    };
  }

  private async resolveActiveOrgId(): Promise<string | undefined> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return undefined;

    if (user.user_metadata?.active_organization_id) {
      return user.user_metadata.active_organization_id;
    }

    const { data: membership } = await this.supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    return membership?.organization_id;
  }
}
