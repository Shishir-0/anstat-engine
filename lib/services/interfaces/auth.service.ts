import { AuthState, LoginCredentials, SignupInput } from '../../types/auth';
import { User, Organization } from '../../types/tenant';

export interface AuthService {
  getAuthState(): Promise<AuthState>;
  login(credentials: LoginCredentials): Promise<AuthState>;
  signup(input: SignupInput): Promise<AuthState>;
  logout(): Promise<boolean>;
  resetPassword(email: string): Promise<{ success: boolean; message: string }>;
  getCurrentUser(): Promise<User | null>;
  getCurrentOrganization(): Promise<Organization | null>;
  updateWorkspaceBranding(branding: { logoUrl?: string; brandColors?: { primary: string; secondary: string } }): Promise<Organization>;
  switchWorkspace(workspaceId: string): Promise<Organization>;
}
