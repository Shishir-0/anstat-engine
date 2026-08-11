import { AIRequest, AIResponse, CostEstimate, ProviderHealth } from '../../types/ai-provider';

export interface AIProviderService {
  generate(request: AIRequest): Promise<AIResponse>;
  estimateCost(request: AIRequest): Promise<CostEstimate>;
  healthCheck(): Promise<ProviderHealth[]>;
}
