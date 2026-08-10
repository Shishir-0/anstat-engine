import { BaseEntity } from './common';

export type ProposalStatus = 'draft' | 'generated' | 'review' | 'sent' | 'won' | 'lost' | 'archived';

export type RequirementPriority = 'critical' | 'high' | 'medium' | 'low';
export type RequirementCategory = 'functional' | 'technical' | 'business' | 'security' | 'performance';

export interface StructuredRequirement {
  id: string;
  title: string;
  description: string;
  category: RequirementCategory;
  priority: RequirementPriority;
  order: number;
}

export interface ProposalDeliverable {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  estimatedHours: number;
}

export interface ProposalSection {
  id: string;
  title: string;
  key: string;
  content: string; // Structured text / markdown
  isAiGenerated: boolean;
  lastRegeneratedAt?: string;
  order: number;
}

export interface ProposalMilestone {
  id: string;
  name: string;
  description?: string;
  deliverables: string[];
  estimatedWeeks: number;
  amountUsd: number;
}

export interface ProposalPricingItem {
  id: string;
  role: string;
  description?: string;
  estimatedHours: number;
  hourlyRateUsd: number;
  subtotalUsd: number;
  source: 'ai_suggested' | 'rate_card' | 'manual_override';
}

export interface ProposalRisk {
  id: string;
  risk: string;
  impact: 'high' | 'medium' | 'low' | 'critical';
  probability: 'high' | 'medium' | 'low';
  mitigation: string;
}

export interface ProposalExportRecord {
  id: string;
  format: 'pdf' | 'docx';
  exportedAt: string;
  downloadUrl: string;
}

export interface ProposalVersion {
  id: string;
  versionNumber: number;
  summary: string;
  author: string;
  createdAt: string;
}

export interface ProposalDocument extends BaseEntity {
  title: string;
  clientId: string;
  clientName: string;
  status: ProposalStatus;
  totalValueUsd: number;
  currency: string;
  executiveSummary: string;
  objectives: string[];
  requirements: StructuredRequirement[];
  scope: string[];
  deliverables: ProposalDeliverable[];
  technologyStack: string[];
  sections: ProposalSection[];
  milestones: ProposalMilestone[];
  pricingBreakdown: ProposalPricingItem[];
  subtotalUsd: number;
  taxUsd: number;
  discountUsd: number;
  assumptions: string[];
  risks: ProposalRisk[];
  outOfScope: string[];
  termsAndConditions: string;
  nextSteps: string[];
  sentAt?: string;
  expiresAt?: string;
  version: number;
  versions: ProposalVersion[];
  exportHistory: ProposalExportRecord[];
  briefInput?: {
    rawContent: string;
    inputMethod: 'text' | 'pdf_simulated' | 'transcript' | 'paste';
    completenessScore: number;
  };
}

export interface BriefInput {
  clientId: string;
  projectTitle: string;
  rawContent: string;
  inputMethod: 'text' | 'pdf_simulated' | 'transcript' | 'paste';
  targetBudgetUsd?: number;
  targetTimelineWeeks?: number;
  preferredTechStack?: string[];
}
