import {
  AIModelDefinition,
  AIProviderId,
  AIRequest,
  AIResponse,
  ProviderHealth,
  AIProviderError,
} from '../../../../types/ai-provider';
import { BaseProviderAdapter } from '../base-provider.adapter';
import { CostCalculator } from '../../cost-calculator';

export class MockAIProviderAdapter extends BaseProviderAdapter {
  readonly providerId: AIProviderId = 'mock';

  public isAvailable(): boolean {
    return true; // Mock provider is always available for dev/testing
  }

  public async healthCheck(): Promise<ProviderHealth> {
    return {
      provider: this.providerId,
      status: 'available',
      lastCheckedAt: new Date().toISOString(),
    };
  }

  public async generate(request: AIRequest, modelDef: AIModelDefinition): Promise<AIResponse> {
    const startTime = Date.now();
    const requestId = request.requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Simulate mock failure if prompt explicitly triggers mock error
    if (request.prompt.includes('TRIGGER_MOCK_FAILURE')) {
      const err: AIProviderError = {
        provider: this.providerId,
        model: modelDef.model,
        code: 'AI_PROVIDER_UNAVAILABLE',
        retryable: true,
        message: 'Simulated mock provider failure for testing fallback safety',
      };
      throw err;
    }

    // Deterministic mock content generation
    const content = `[MOCK AI OUTPUT] Operation: ${request.operation} | Model: ${modelDef.displayName}\nPrompt: ${request.prompt}`;
    const inputTokens = Math.max(50, Math.ceil(request.prompt.length / 4));
    const outputTokens = Math.max(100, Math.ceil(content.length / 4));
    const totalTokens = inputTokens + outputTokens;

    const providerCost = CostCalculator.calculateProviderCostUSD(inputTokens, outputTokens, modelDef);
    const aiCreditsConsumed = CostCalculator.calculateAICredits(inputTokens, outputTokens, modelDef);
    const latencyMs = Math.max(15, Date.now() - startTime);

    return {
      requestId,
      provider: this.providerId,
      model: modelDef.model,
      content,
      inputTokens,
      outputTokens,
      totalTokens,
      providerCost,
      aiCreditsConsumed,
      latencyMs,
      fallbackUsed: false,
      status: 'SETTLED',
    };
  }
}
