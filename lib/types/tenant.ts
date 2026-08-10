import { BaseEntity } from './common';

export type UserRole = 'owner' | 'admin' | 'lead_engineer' | 'engineer' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  organizationId: string;
  createdAt: string;
  twoFactorEnabled?: boolean;
}

export interface Organization extends Omit<BaseEntity, 'organizationId'> {
  name: string;
  slug: string;
  logoUrl?: string;
  brandColors?: {
    primary: string;
    secondary: string;
  };
  rateCard: {
    developerHourlyRate: number;
    seniorHourlyRate: number;
    architectHourlyRate: number;
    currency: string;
  };
  githubAppConnected: boolean;
  githubOrgName?: string;
  plan: 'agency' | 'enterprise' | 'growth';
  monthlyAiBudget: number;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  user: User;
  role: UserRole;
  joinedAt: string;
}
