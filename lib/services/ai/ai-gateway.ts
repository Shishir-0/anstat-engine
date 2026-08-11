import {
  AIRequest,
  AIResponse,
  CostEstimate,
  ProviderHealth,
  AIProviderId,
  AIProviderError,
  AIProviderErrorCode,
} from '../../types/ai-provider';
import { AIProviderService } from '../interfaces/ai-provider.service';
import { EntitlementService } from '../interfaces/entitlement.service';
import { ModelRouter } from './model-router';
import { CostCalculator } from './cost-calculator';
import { BaseProviderAdapter } from './providers/base-provider.adapter';
import { GoogleAIProviderAdapter } from './providers/google/google-ai.provider';
import { AnthropicAIProviderAdapter } from './providers/anthropic/anthropic-ai.provider';
import { OpenAIProviderAdapter } from './providers/openai/openai-ai.provider';
import { MockAIProviderAdapter } from './providers/mock/mock-ai.provider';

export class AIGatewayService implements AIProviderService {
  private router: ModelRouter;
  private adapters: Map<AIProviderId, BaseProviderAdapter>;
  private entitlementService?: EntitlementService;
  private settledRequests: Set<string> = new Set();

  constructor(
    router: ModelRouter = new ModelRouter(),
    entitlementService?: EntitlementService
  ) {
    this.router = router;
    this.entitlementService = entitlementService;

    this.adapters = new Map<AIProviderId, BaseProviderAdapter>([
      ['google', new GoogleAIProviderAdapter()],
      ['anthropic', new AnthropicAIProviderAdapter()],
      ['openai', new OpenAIProviderAdapter()],
      ['mock', new MockAIProviderAdapter()],
    ]);
  }

  private resolveEntitlementService(): EntitlementService {
    if (this.entitlementService) {
      return this.entitlementService;
    }
    // Lazy resolve to avoid circular import loops
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getEntitlementService } = require('../registry');
    return getEntitlementService();
  }

  /**
   * Return mode configuration: 'mock' | 'production'
   */
  private getMode(): 'mock' | 'production' {
    const envMode = process.env.AI_PROVIDER_MODE?.toLowerCase();
    if (envMode === 'mock') return 'mock';
    if (envMode === 'production') return 'production';
    if (process.env.NODE_ENV === 'test') return 'mock';
    return 'production';
  }

  /**
   * Health check for all configured AI provider adapters.
   */
  public async healthCheck(): Promise<ProviderHealth[]> {
    const results: ProviderHealth[] = [];
    for (const adapter of Array.from(this.adapters.values())) {
      results.push(await adapter.healthCheck());
    }
    return results;
  }

  /**
   * Estimate cost for an incoming AI request.
   */
  public async estimateCost(request: AIRequest): Promise<CostEstimate> {
    const candidate = this.router.route(request, 999999);
    return CostCalculator.estimateCost(request, candidate || undefined);
  }

  /**
   * Execute an AI request through the complete, transaction-safe AI Provider Gateway lifecycle.
   */
  public async generate(request: AIRequest): Promise<AIResponse> {
    const requestId =
      request.requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const mode = this.getMode();
    const entitlement = this.resolveEntitlementService();

    // Idempotency check: prevent double settlement for the same request_id
    if (this.settledRequests.has(requestId)) {
      const err: AIProviderError = {
        provider: request.preferredProvider || 'mock',
        code: 'INVALID_AMOUNT',
        retryable: false,
        message: `Duplicate request settlement rejected for request_id=${requestId}`,
      };
      throw err;
    }

    // 1. Check health of providers
    const healthList = await this.healthCheck();
    const healthMap = new Map<AIProviderId, ProviderHealth>(
      healthList.map((h) => [h.provider, h])
    );

    // Production mode safeguard: Reject mock adapter in production mode
    if (mode === 'production') {
      const anyRealAvailable =
        this.adapters.get('google')?.isAvailable() ||
        this.adapters.get('anthropic')?.isAvailable() ||
        this.adapters.get('openai')?.isAvailable();

      if (!anyRealAvailable) {
        const err: AIProviderError = {
          provider: 'google',
          code: 'AI_PROVIDER_UNAVAILABLE',
          retryable: true,
          message:
            'AI_PROVIDER_MODE=production but no real provider API keys (GOOGLE_AI_API_KEY, ANTHROPIC_API_KEY, OPENAI_API_KEY) are configured',
        };
        throw err;
      }
    }

    // 2. Fetch active organization entitlement state
    const usageSummary = await entitlement.getUsageSummary(request.organizationId);
    const availableCredits = usageSummary.remaining.aiCredits;

    // Check subscription status
    if (usageSummary.subscriptionStatus === 'expired' || usageSummary.subscriptionStatus === 'cancelled') {
      const err: AIProviderError = {
        provider: 'google',
        code: 'SUBSCRIPTION_EXPIRED',
        retryable: false,
        message: `Organization subscription status is ${usageSummary.subscriptionStatus}`,
      };
      throw err;
    }

    // 3. Select candidate models using CAPABILITY-FIRST, COST-SECOND routing
    let candidates = this.router.selectCandidates(request, availableCredits, healthMap);

    if (mode === 'production') {
      candidates = candidates.filter((c) => c.provider !== 'mock');
    } else if (mode === 'mock') {
      const mockCandidate = this.router
        .selectCandidates(request, availableCredits)
        .find((c) => c.provider === 'mock');
      if (mockCandidate) {
        candidates = [mockCandidate, ...candidates.filter((c) => c.provider !== 'mock')];
      }
    }

    if (candidates.length === 0) {
      // Determine if rejected due to credit limit vs capability/provider availability
      const unconstrainedCandidates = this.router.selectCandidates(request, 999999, healthMap);
      if (unconstrainedCandidates.length > 0) {
        const err: AIProviderError = {
          provider: unconstrainedCandidates[0].provider,
          model: unconstrainedCandidates[0].model,
          code: 'AI_CREDIT_LIMIT_REACHED',
          retryable: false,
          message: `Insufficient AI credits remaining (${availableCredits} credits available)`,
        };
        throw err;
      }

      const err: AIProviderError = {
        provider: 'google',
        code: 'MODEL_NOT_FOUND',
        retryable: false,
        message: 'No active AI model is available that matches the requested capability and context requirements',
      };
      throw err;
    }

    // 4. Transactional Execution & Credit-Safe Fallback Loop
    let lastError: AIProviderError | null = null;
    let fallbackUsed = false;

    for (let i = 0; i < candidates.length; i++) {
      const targetModel = candidates[i];
      const adapter = this.adapters.get(targetModel.provider);

      if (!adapter || !adapter.isAvailable()) {
        continue;
      }

      if (i > 0) {
        fallbackUsed = true;
        // Fallback Safety Re-Authorization: Re-verify affordability before executing fallback
        const fallbackEstimate = CostCalculator.estimateCost(request, targetModel);
        const currentSummary = await entitlement.getUsageSummary(request.organizationId);

        if (currentSummary.remaining.aiCredits < fallbackEstimate.estimatedCredits) {
          const err: AIProviderError = {
            provider: targetModel.provider,
            model: targetModel.model,
            code: 'AI_CREDIT_LIMIT_REACHED',
            retryable: false,
            message: `Fallback model ${targetModel.displayName} exceeds remaining AI credits`,
          };
          throw err;
        }
      }

      // Execute provider adapter
      try {
        const reqWithId: AIRequest = { ...request, requestId };
        const response = await adapter.generate(reqWithId, targetModel);
        response.fallbackUsed = fallbackUsed;

        // 5. Atomic Credit Consumption & Settlement
        const actualCredits = response.aiCreditsConsumed;
        const consumeResult = await entitlement.consumeAICredits(
          actualCredits,
          request.organizationId
        );

        if (!consumeResult.allowed) {
          const err: AIProviderError = {
            provider: targetModel.provider,
            model: targetModel.model,
            code: (consumeResult.reason as AIProviderErrorCode) || 'AI_CREDIT_LIMIT_REACHED',
            retryable: false,
            message: `Failed to settle AI credit consumption with entitlement engine: ${consumeResult.message}`,
          };
          throw err;
        }

        // Record request ID as settled for idempotency
        this.settledRequests.add(requestId);

        return response;
      } catch (err: unknown) {
        if (typeof err === 'object' && err !== null && 'code' in err) {
          lastError = err as AIProviderError;
        } else {
          lastError = {
            provider: targetModel.provider,
            model: targetModel.model,
            code: 'AI_PROVIDER_UNAVAILABLE',
            retryable: true,
            message: err instanceof Error ? err.message : String(err),
          };
        }

        // Non-retryable errors stop fallback loop immediately
        if (lastError.code === 'PERMISSION_DENIED' || lastError.code === 'SUBSCRIPTION_EXPIRED') {
          throw lastError;
        }
      }
    }

    // Every candidate provider failed
    throw (
      lastError || {
        provider: 'google',
        code: 'AI_PROVIDER_UNAVAILABLE',
        retryable: true,
        message: 'All available AI provider adapters failed to execute the request',
      }
    );
  }
}
