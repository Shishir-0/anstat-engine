import { AIModelDefinition, AIRequest, CostEstimate } from '../../types/ai-provider';

export class CostCalculator {
  // Baseline credit conversion multiplier (100 credits per 1.00 USD provider cost)
  private static readonly CREDIT_MULTIPLIER = 100;

  /**
   * Calculate exact provider cost in USD based on input & output token counts.
   * Input and output pricing in model definition are given in USD per 1,000,000 tokens.
   */
  public static calculateProviderCostUSD(
    inputTokens: number,
    outputTokens: number,
    modelDef?: AIModelDefinition
  ): number {
    const safeInputTokens = Math.max(0, isNaN(inputTokens) || !isFinite(inputTokens) ? 0 : inputTokens);
    const safeOutputTokens = Math.max(0, isNaN(outputTokens) || !isFinite(outputTokens) ? 0 : outputTokens);

    const inputRatePerMillion = modelDef?.inputCostPerMillionTokens ?? 3.00; // $3/1M default
    const outputRatePerMillion = modelDef?.outputCostPerMillionTokens ?? 15.00; // $15/1M default

    const inputCost = (safeInputTokens * inputRatePerMillion) / 1000000;
    const outputCost = (safeOutputTokens * outputRatePerMillion) / 1000000;

    const totalCost = inputCost + outputCost;
    return Math.max(0, Number(totalCost.toFixed(6)));
  }

  /**
   * Calculate AI Credits consumed from actual token counts.
   * Formula: (Provider Cost USD) * 100
   * Integer ceiling applied with minimum 1 credit when token usage > 0.
   */
  public static calculateAICredits(
    inputTokens: number,
    outputTokens: number,
    modelDef?: AIModelDefinition
  ): number {
    const safeInputTokens = Math.max(0, isNaN(inputTokens) || !isFinite(inputTokens) ? 0 : inputTokens);
    const safeOutputTokens = Math.max(0, isNaN(outputTokens) || !isFinite(outputTokens) ? 0 : outputTokens);

    if (safeInputTokens === 0 && safeOutputTokens === 0) {
      return 0;
    }

    const providerCostUSD = this.calculateProviderCostUSD(safeInputTokens, safeOutputTokens, modelDef);
    if (providerCostUSD <= 0) {
      return 0;
    }

    const rawCredits = providerCostUSD * this.CREDIT_MULTIPLIER;
    const integerCredits = Math.ceil(rawCredits);

    return Math.max(1, integerCredits);
  }

  /**
   * Estimate token usage and credit requirement for an incoming AIRequest before provider execution.
   */
  public static estimateCost(request: AIRequest, modelDef?: AIModelDefinition): CostEstimate {
    const promptLen = request.prompt?.length ?? 0;
    const sysLen = request.systemPrompt?.length ?? 0;
    const ctxLen = request.context ? JSON.stringify(request.context).length : 0;

    // Standard character to token heuristic (~4 chars/token)
    const estimatedInputTokens = Math.max(50, Math.ceil((promptLen + sysLen + ctxLen) / 4));

    // Operation & Complexity heuristic for expected output tokens
    let expectedOutputTokens = 500;
    switch (request.operation) {
      case 'proposal_generation':
        expectedOutputTokens = 1500;
        break;
      case 'code_generation':
      case 'debug_patch':
        expectedOutputTokens = 2000;
        break;
      case 'security_analysis':
      case 'debug_root_cause':
        expectedOutputTokens = 1200;
        break;
      case 'code_review':
        expectedOutputTokens = 1000;
        break;
      default:
        expectedOutputTokens = 600;
    }

    if (request.complexity === 'high') expectedOutputTokens *= 1.5;
    if (request.complexity === 'critical') expectedOutputTokens *= 2.0;

    const estimatedProviderCostUSD = this.calculateProviderCostUSD(
      estimatedInputTokens,
      expectedOutputTokens,
      modelDef
    );
    const estimatedCredits = this.calculateAICredits(
      estimatedInputTokens,
      expectedOutputTokens,
      modelDef
    );

    return {
      estimatedInputTokens,
      estimatedOutputTokens: Math.ceil(expectedOutputTokens),
      estimatedProviderCostUSD,
      estimatedCredits,
    };
  }
}
