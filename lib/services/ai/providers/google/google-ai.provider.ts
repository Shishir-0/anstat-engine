import { GoogleGenAI } from '@google/genai';
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

export class GoogleAIProviderAdapter extends BaseProviderAdapter {
  readonly providerId: AIProviderId = 'google';

  public isAvailable(): boolean {
    return Boolean(process.env.GOOGLE_AI_API_KEY);
  }

  public async healthCheck(): Promise<ProviderHealth> {
    const available = this.isAvailable();
    return {
      provider: this.providerId,
      status: available ? 'available' : 'unavailable',
      lastCheckedAt: new Date().toISOString(),
      errorMessage: available ? undefined : 'GOOGLE_AI_API_KEY environment variable is not configured',
    };
  }

  public async generate(request: AIRequest, modelDef: AIModelDefinition): Promise<AIResponse> {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      const err: AIProviderError = {
        provider: this.providerId,
        model: modelDef.model,
        code: 'CONFIGURATION_ERROR',
        retryable: false,
        message: 'GOOGLE_AI_API_KEY server environment variable missing',
      };
      throw err;
    }

    const startTime = Date.now();
    const requestId = request.requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    try {
      const ai = new GoogleGenAI({ apiKey });
      const promptText = request.systemPrompt
        ? `${request.systemPrompt}\n\nUser Request: ${request.prompt}`
        : request.prompt;

      const response = await ai.models.generateContent({
        model: modelDef.model,
        contents: promptText,
      });

      const latencyMs = Date.now() - startTime;
      const content = response.text || '';

      // Normalize token usage from metadata or calculate trusted fallback
      const usageMetadata = response.usageMetadata;
      const inputTokens = usageMetadata?.promptTokenCount ?? Math.max(10, Math.ceil(promptText.length / 4));
      const outputTokens = usageMetadata?.candidatesTokenCount ?? Math.max(10, Math.ceil(content.length / 4));
      const totalTokens = usageMetadata?.totalTokenCount ?? inputTokens + outputTokens;

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
        message: `Google Gemini API Execution Error: ${errorMsg}`,
      };
      throw providerError;
    }
  }
}
