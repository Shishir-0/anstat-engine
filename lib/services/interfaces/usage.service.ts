import { UsageRecord, FeatureCostBreakdown, ModelUsageBreakdown, BudgetStatus } from '../../types/usage';
import { PaginatedResult, PaginationParams } from '../../types/common';

export interface UsageService {
  getBudgetStatus(): Promise<BudgetStatus>;
  getFeatureBreakdown(): Promise<FeatureCostBreakdown[]>;
  getModelBreakdown(): Promise<ModelUsageBreakdown[]>;
  listUsageRecords(params?: PaginationParams & { feature?: string }): Promise<PaginatedResult<UsageRecord>>;
}
