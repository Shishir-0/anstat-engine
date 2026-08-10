import { UsageService } from '../interfaces/usage.service';
import { UsageRecord, FeatureCostBreakdown, ModelUsageBreakdown, BudgetStatus } from '../../types/usage';
import { PaginatedResult, PaginationParams } from '../../types/common';
import { MOCK_BUDGET_STATUS, MOCK_USAGE_RECORDS } from '../../mock/seed-data';

export class MockUsageService implements UsageService {
  private records: UsageRecord[] = [...MOCK_USAGE_RECORDS];

  async getBudgetStatus(): Promise<BudgetStatus> {
    return MOCK_BUDGET_STATUS;
  }

  async getFeatureBreakdown(): Promise<FeatureCostBreakdown[]> {
    return [
      { feature: 'Code Generation', costUsd: 345.20, percentage: 53.7 },
      { feature: 'Proposals', costUsd: 182.50, percentage: 28.4 },
      { feature: 'Security Scans', costUsd: 74.80, percentage: 11.6 },
      { feature: 'Debugging', costUsd: 40.00, percentage: 6.3 },
    ];
  }

  async getModelBreakdown(): Promise<ModelUsageBreakdown[]> {
    return [
      { modelId: 'claude-3-5-sonnet', modelName: 'Claude 3.5 Sonnet', tokens: 1850000, costUsd: 485.00 },
      { modelId: 'gpt-4o', modelName: 'GPT-4o', tokens: 620000, costUsd: 112.50 },
      { modelId: 'anstat-code-deepseek', modelName: 'ANSTAT Code Engine V2', tokens: 450000, costUsd: 45.00 },
    ];
  }

  async listUsageRecords(params?: PaginationParams & { feature?: string }): Promise<PaginatedResult<UsageRecord>> {
    let filtered = [...this.records];
    if (params?.feature) {
      filtered = filtered.filter(r => r.feature === params.feature);
    }
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;

    return {
      data: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit) || 1,
    };
  }
}
