import { AuthService } from '../interfaces/auth.service';
import { AuthState, LoginCredentials, SignupInput } from '../../types/auth';
import { User, Organization, UserRole } from '../../types/tenant';
import { createClient } from '../../supabase/client';

interface RawOrganizationRecord {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  brand_colors?: { primary: string; secondary: string } | null;
  rate_card?: { developerHourlyRate: number; seniorHourlyRate: number; architectHourlyRate: number; currency: string } | null;
  github_app_connected?: boolean | null;
  plan?: string | null;
  monthly_ai_budget_usd?: number | string | null;
  created_at: string;
  updated_at: string;
}

export class SupabaseAuthService implements AuthService {
  private get supabase() {
    return createClient();
  }

  async getAuthState(): Promise<AuthState> {
    try {
      const { data: { session }, error: sessionError } = await this.supabase.auth.getSession();
      if (sessionError || !session) {
        return {
          isAuthenticated: false,
          user: null,
          organization: null,
        };
      }

      const user = await this.getCurrentUser();
      const organization = await this.getCurrentOrganization();

      return {
        isAuthenticated: !!user,
        user,
        organization,
        token: session.access_token,
      };
    } catch {
      return {
        isAuthenticated: false,
        user: null,
        organization: null,
      };
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthState> {
    if (!credentials.password) {
      throw new Error('Password is required');
    }

    const { error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message || 'Invalid email or password');
    }

    return this.getAuthState();
  }

  async signup(input: SignupInput): Promise<AuthState> {
    if (!input.password) {
      throw new Error('Password is required for signup');
    }

    const { data, error } = await this.supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.name,
          workspace_name: input.organizationName,
        },
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to create account');
    }

    if (data.session === null && data.user) {
      return {
        isAuthenticated: false,
        user: null,
        organization: null,
      };
    }

    return this.getAuthState();
  }

  async logout(): Promise<boolean> {
    const { error } = await this.supabase.auth.signOut();
    return !error;
  }

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login?reset=true` : undefined,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: 'Password reset instructions sent to your email.',
    };
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser } } = await this.supabase.auth.getUser();
      if (!authUser) return null;

      const { data: profile } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const org = await this.getCurrentOrganization();

      let role: UserRole = 'owner';
      const orgId = org?.id || '';

      if (orgId) {
        const { data: membership } = await this.supabase
          .from('memberships')
          .select('role')
          .eq('user_id', authUser.id)
          .eq('organization_id', orgId)
          .maybeSingle();

        if (membership) {
          role = membership.role as UserRole;
        }
      }

      return {
        id: authUser.id,
        email: authUser.email || profile?.email || '',
        name: profile?.full_name || authUser.user_metadata?.full_name || 'ANSTAT User',
        avatarUrl: profile?.avatar_url || undefined,
        role,
        organizationId: orgId,
        createdAt: profile?.created_at || authUser.created_at,
      };
    } catch {
      return null;
    }
  }

  async getCurrentOrganization(): Promise<Organization | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return null;

      const targetOrgId = user.user_metadata?.active_organization_id;

      let query = this.supabase
        .from('memberships')
        .select('organization_id, role, organizations!inner(*)')
        .eq('user_id', user.id);

      if (targetOrgId) {
        query = query.eq('organization_id', targetOrgId);
      }

      const { data: memberships } = await query;

      if (!memberships || memberships.length === 0) {
        const { data: fallbackMemberships } = await this.supabase
          .from('memberships')
          .select('organization_id, role, organizations!inner(*)')
          .eq('user_id', user.id)
          .limit(1);

        if (!fallbackMemberships || fallbackMemberships.length === 0) return null;
        
        const orgData = (fallbackMemberships[0] as unknown as { organizations: RawOrganizationRecord }).organizations;
        return this.mapOrganization(orgData);
      }

      const orgData = (memberships[0] as unknown as { organizations: RawOrganizationRecord }).organizations;
      return this.mapOrganization(orgData);
    } catch {
      return null;
    }
  }

  async updateWorkspaceBranding(branding: { logoUrl?: string; brandColors?: { primary: string; secondary: string } }): Promise<Organization> {
    const org = await this.getCurrentOrganization();
    if (!org) throw new Error('No active organization found');

    const updatePayload: Record<string, unknown> = {};
    if (branding.logoUrl !== undefined) updatePayload.logo_url = branding.logoUrl;
    if (branding.brandColors !== undefined) updatePayload.brand_colors = branding.brandColors;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('organizations')
      .update(updatePayload)
      .eq('id', org.id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to update workspace branding');
    }

    return this.mapOrganization(data as RawOrganizationRecord);
  }

  async switchWorkspace(workspaceId: string): Promise<Organization> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: membership } = await this.supabase
      .from('memberships')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('organization_id', workspaceId)
      .maybeSingle();

    if (!membership) {
      throw new Error('Access denied: You are not a member of this workspace');
    }

    await this.supabase.auth.updateUser({
      data: { active_organization_id: workspaceId },
    });

    const targetOrg = await this.getCurrentOrganization();
    if (!targetOrg) throw new Error('Failed to load switched organization');
    return targetOrg;
  }

  private mapOrganization(raw: RawOrganizationRecord): Organization {
    return {
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      logoUrl: raw.logo_url || undefined,
      brandColors: raw.brand_colors || { primary: '#0f172a', secondary: '#3b82f6' },
      rateCard: raw.rate_card || { developerHourlyRate: 100, seniorHourlyRate: 150, architectHourlyRate: 200, currency: 'USD' },
      githubAppConnected: raw.github_app_connected || false,
      plan: (raw.plan || 'agency') as 'agency' | 'enterprise' | 'growth',
      monthlyAiBudget: Number(raw.monthly_ai_budget_usd || 500),
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  }
}
