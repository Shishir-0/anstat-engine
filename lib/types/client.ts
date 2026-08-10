import { BaseEntity } from './common';

export type ClientStatus = 'active' | 'prospect' | 'inactive' | 'archived';

export interface ClientContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  isPrimary: boolean;
}

export interface ClientProject {
  id: string;
  name: string;
  status: 'planning' | 'in_development' | 'maintained' | 'completed';
  totalValueUsd: number;
  startDate: string;
}

export interface Client extends BaseEntity {
  name: string;
  slug: string;
  companyName: string;
  industry: string;
  website?: string;
  status: ClientStatus;
  primaryContact: ClientContact;
  contacts: ClientContact[];
  projects: ClientProject[];
  totalRevenueUsd: number;
  totalProposalsCount: number;
  wonProposalsCount: number;
  notes?: string;
}
