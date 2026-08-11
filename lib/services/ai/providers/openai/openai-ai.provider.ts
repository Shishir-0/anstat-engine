import OpenAI from 'openai';
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

export class OpenAIProviderAdapter extends BaseProviderAdapter {
  readonly providerId: AIProviderId = 'openai';

  public isAvailable(): boolean {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  public async healthCheck(): Promise<ProviderHealth> {
    const available = this.isAvailable();
    return {
      provider: this.providerId,
      status: available ? 'available' : 'unavailable',
      lastCheckedAt: new Date().toISOString(),
      errorMessage: available ? undefined : 'OPENAI_API_KEY environment variable is not configured',
    };
  }

  public async generate(request: AIRequest, modelDef: AIModelDefinition): Promise<AIResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const err: AIProviderError = {
        provider: this.providerId,
        model: modelDef.model,
        code: 'CONFIGURATION_ERROR',
        retryable: false,
        message: 'OPENAI_API_KEY server environment variable missing',
      };
      throw err;
    }

    const startTime = Date.now();
    const requestId = request.requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const openai = new OpenAI({ apiKey });

      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }
      messages.push({ role: 'user', content: request.prompt });

      const completion = await openai.chat.completions.create({
        model: modelDef.model,
        messages,
      });

      const latencyMs = Date.now() - startTime;
      const content = completion.choices[0]?.message?.content || '';

      const inputTokens = completion.usage?.prompt_tokens ?? Math.max(10, Math.ceil(request.prompt.length / 4));
      const outputTokens = completion.usage?.completion_tokens ?? Math.max(10, Math.ceil(content.length / 4));
      const totalTokens = completion.usage?.total_tokens ?? inputTokens + outputTokens;

      const providerCost = CostCalculator.calculateProviderCostUSD(inputTokens, outputTokens, modelDef);
      const aiCreditsConsumed = CostCalculator.calculateAICredits(inputTokens, outputTokens, modelDef);

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
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const providerError: AIProviderError = {
        provider: this.providerId,
        model: modelDef.model,
        code: 'AI_PROVIDER_UNAVAILABLE',
        retryable: true,
        message: `OpenAI API Execution Error: ${errorMsg}`,
      };
      throw providerError;
    }
  }
}
