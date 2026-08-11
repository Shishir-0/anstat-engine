import Anthropic from '@anthropic-ai/sdk';
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

export class AnthropicAIProviderAdapter extends BaseProviderAdapter {
  readonly providerId: AIProviderId = 'anthropic';

  public isAvailable(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  }

  public async healthCheck(): Promise<ProviderHealth> {
    const available = this.isAvailable();
    return {
      provider: this.providerId,
      status: available ? 'available' : 'unavailable',
      lastCheckedAt: new Date().toISOString(),
      errorMessage: available ? undefined : 'ANTHROPIC_API_KEY environment variable is not configured',
    };
  }

  public async generate(request: AIRequest, modelDef: AIModelDefinition): Promise<AIResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      const err: AIProviderError = {
        provider: this.providerId,
        model: modelDef.model,
        code: 'CONFIGURATION_ERROR',
        retryable: false,
        message: 'ANTHROPIC_API_KEY server environment variable missing',
      };
      throw err;
    }

    const startTime = Date.now();
    const requestId = request.requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const anthropic = new Anthropic({ apiKey });

      const msg = await anthropic.messages.create({
        model: modelDef.model,
        max_tokens: 4096,
        system: request.systemPrompt,
        messages: [{ role: 'user', content: request.prompt }],
      });

      const latencyMs = Date.now() - startTime;
      const contentText = msg.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as { type: 'text'; text: string }).text)
        .join('\n');

      const inputTokens = msg.usage?.input_tokens ?? Math.max(10, Math.ceil(request.prompt.length / 4));
      const outputTokens = msg.usage?.output_tokens ?? Math.max(10, Math.ceil(contentText.length / 4));
      const totalTokens = inputTokens + outputTokens;

      const providerCost = CostCalculator.calculateProviderCostUSD(inputTokens, outputTokens, modelDef);
      const aiCreditsConsumed = CostCalculator.calculateAICredits(inputTokens, outputTokens, modelDef);

      return {
        requestId,
        provider: this.providerId,
        model: modelDef.model,
        content: contentText,
        inputTokens,
        outputTokens,
        totalTokens,
        providerCost,
        aiCreditsConsumed,
        latencyMs,
        fallbackUsed: false,
        status: 'SETTLED',
      };
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const providerError: AIProviderError = {
        provider: this.providerId,
        model: modelDef.model,
        code: 'AI_PROVIDER_UNAVAILABLE',
        retryable: true,
        message: `Anthropic Claude API Execution Error: ${errorMsg}`,
      };
      throw providerError;
    }
  }
}
