import { AuthService } from '../interfaces/auth.service';
import { AuthState, LoginCredentials, SignupInput } from '../../types/auth';
import { User, Organization } from '../../types/tenant';
import { MOCK_USER, MOCK_ORGANIZATION } from '../../mock/seed-data';

const SECONDARY_WORKSPACE: Organization = {
  id: 'org_personal_02',
  name: 'Personal Dev Workspace',
  slug: 'personal-workspace',
  logoUrl: '/logo-personal.svg',
  brandColors: { primary: '#059669', secondary: '#0F172A' },
  rateCard: { developerHourlyRate: 100, seniorHourlyRate: 150, architectHourlyRate: 200, currency: 'USD' },
  githubAppConnected: false,
  plan: 'growth',
  monthlyAiBudget: 1000,
  createdAt: '2025-06-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

export class MockAuthService implements AuthService {
  private user: User | null = MOCK_USER;
  private currentOrg: Organization = MOCK_ORGANIZATION;
  private availableOrgs: Organization[] = [MOCK_ORGANIZATION, SECONDARY_WORKSPACE];

  async getAuthState(): Promise<AuthState> {
    return {
      isAuthenticated: !!this.user,
      user: this.user,
      organization: this.currentOrg,
      token: 'mock-jwt-token-anstat-dev',
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthState> {
    this.user = {
      ...MOCK_USER,
      email: credentials.email || 'demo@anstat.ai',
      name: credentials.email.includes('demo') ? 'Demo User' : 'Shishir Kumar',
    };
    return this.getAuthState();
  }

  async signup(input: SignupInput): Promise<AuthState> {
    this.user = {
      ...MOCK_USER,
      id: `user_${Date.now()}`,
      name: input.name,
      email: input.email,
    };
    this.currentOrg = {
      ...MOCK_ORGANIZATION,
      id: `org_${Date.now()}`,
      name: input.organizationName,
      slug: input.organizationName.toLowerCase().replace(/\s+/g, '-'),
    };
    this.availableOrgs.push(this.currentOrg);
    return this.getAuthState();
  }

  async logout(): Promise<boolean> {
    this.user = null;
    return true;
  }

  async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: "If an account exists for this email, you'll receive reset instructions.",
    };
  }

  async getCurrentUser(): Promise<User | null> {
    return this.user;
  }

  async getCurrentOrganization(): Promise<Organization | null> {
    return this.currentOrg;
  }

  async updateWorkspaceBranding(branding: { logoUrl?: string; brandColors?: { primary: string; secondary: string } }): Promise<Organization> {
    this.currentOrg = {
      ...this.currentOrg,
      logoUrl: branding.logoUrl || this.currentOrg.logoUrl,
      brandColors: branding.brandColors || this.currentOrg.brandColors,
      updatedAt: new Date().toISOString(),
    };
    return this.currentOrg;
  }

  async switchWorkspace(workspaceId: string): Promise<Organization> {
    const target = this.availableOrgs.find(o => o.id === workspaceId);
    if (target) {
      this.currentOrg = target;
    }
    return this.currentOrg;
  }
}
