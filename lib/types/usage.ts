import { BaseEntity } from './common';

export interface UsageRecord extends BaseEntity {
  feature: 'proposal' | 'code' | 'security' | 'debugging';
  modelId: string;
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUsd: number;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface FeatureCostBreakdown {
  feature: string;
  costUsd: number;
  percentage: number;
}

export interface ModelUsageBreakdown {
  modelId: string;
  modelName: string;
  tokens: number;
  costUsd: number;
}

export interface BudgetStatus {
  monthlyBudgetUsd: number;
  usedUsd: number;
  remainingUsd: number;
  percentUsed: number;
  alertLevel: 'normal' | '70_percent' | '85_percent' | '95_percent' | 'exceeded';
}
