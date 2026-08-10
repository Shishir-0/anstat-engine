import { User, Organization } from './tenant';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  organization: Organization | null;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password?: string;
  organizationName: string;
}
