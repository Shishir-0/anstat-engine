import { AIModelDefinition, AIProviderId, AIModelCapability } from '../../types/ai-provider';

/**
 * Isolated Configuration Registry for Production AI Models.
 * Pricing is expressed in USD per million tokens ($/1M).
 * Lifecycle status: 'active' | 'deprecated' | 'disabled'.
 */
export const MODEL_REGISTRY: AIModelDefinition[] = [
  // --- Google Gemini Models ---
  {
    provider: 'google',
    model: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    capabilities: ['text_generation', 'fast_response', 'structured_output', 'code_generation'],
    contextWindow: 1000000,
    inputCostPerMillionTokens: 0.15,
    outputCostPerMillionTokens: 0.60,
    status: 'active',
    priority: 10,
    minComplexity: 'low',
    maxComplexity: 'medium',
  },
  {
    provider: 'google',
    model: 'gemini-2.5-pro',
    displayName: 'Gemini 2.5 Pro',
    capabilities: ['text_generation', 'code_generation', 'long_context', 'reasoning', 'security_analysis'],
    contextWindow: 2000000,
    inputCostPerMillionTokens: 1.25,
    outputCostPerMillionTokens: 5.00,
    status: 'active',
    priority: 25,
    minComplexity: 'medium',
    maxComplexity: 'critical',
  },

  // --- Anthropic Claude Models ---
  {
    provider: 'anthropic',
    model: 'claude-3-5-haiku-20241022',
    displayName: 'Claude 3.5 Haiku',
    capabilities: ['text_generation', 'fast_response', 'code_generation', 'structured_output'],
    contextWindow: 200000,
    inputCostPerMillionTokens: 0.80,
    outputCostPerMillionTokens: 4.00,
    status: 'active',
    priority: 15,
    minComplexity: 'low',
    maxComplexity: 'medium',
  },
  {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    displayName: 'Claude 3.5 Sonnet',
    capabilities: [
      'text_generation',
      'code_generation',
      'code_review',
      'debugging',
      'reasoning',
      'security_analysis',
      'structured_output',
    ],
    contextWindow: 200000,
    inputCostPerMillionTokens: 3.00,
    outputCostPerMillionTokens: 15.00,
    status: 'active',
    priority: 30,
    minComplexity: 'medium',
    maxComplexity: 'critical',
  },

  // --- OpenAI Models ---
  {
    provider: 'openai',
    model: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    capabilities: ['text_generation', 'fast_response', 'code_generation', 'structured_output'],
    contextWindow: 128000,
    inputCostPerMillionTokens: 0.15,
    outputCostPerMillionTokens: 0.60,
    status: 'active',
    priority: 12,
    minComplexity: 'low',
    maxComplexity: 'medium',
  },
  {
    provider: 'openai',
    model: 'gpt-4o',
    displayName: 'GPT-4o',
    capabilities: [
      'text_generation',
      'code_generation',
      'code_review',
      'debugging',
      'reasoning',
      'structured_output',
      'security_analysis',
    ],
    contextWindow: 128000,
    inputCostPerMillionTokens: 2.50,
    outputCostPerMillionTokens: 10.00,
    status: 'active',
    priority: 28,
    minComplexity: 'medium',
    maxComplexity: 'critical',
  },
  {
    provider: 'openai',
    model: 'o3-mini',
    displayName: 'OpenAI o3-mini Reasoning',
    capabilities: ['reasoning', 'debugging', 'security_analysis', 'code_generation'],
    contextWindow: 200000,
    inputCostPerMillionTokens: 1.10,
    outputCostPerMillionTokens: 4.40,
    status: 'active',
    priority: 22,
    minComplexity: 'high',
    maxComplexity: 'critical',
  },

  // --- Mock Models (Development / Offline Test Mode) ---
  {
    provider: 'mock',
    model: 'mock-fast-model',
    displayName: 'Mock Fast Engine',
    capabilities: ['text_generation', 'fast_response', 'code_generation', 'structured_output', 'code_review'],
    contextWindow: 500000,
    inputCostPerMillionTokens: 0.10,
    outputCostPerMillionTokens: 0.50,
    status: 'active',
    priority: 1,
    minComplexity: 'low',
    maxComplexity: 'medium',
  },
  {
    provider: 'mock',
    model: 'mock-reasoning-model',
    displayName: 'Mock Deep Reasoning Engine',
    capabilities: [
      'text_generation',
      'code_generation',
      'code_review',
      'debugging',
      'reasoning',
      'security_analysis',
      'long_context',
      'structured_output',
    ],
    contextWindow: 1000000,
    inputCostPerMillionTokens: 1.00,
    outputCostPerMillionTokens: 5.00,
    status: 'active',
    priority: 5,
    minComplexity: 'high',
    maxComplexity: 'critical',
  },
];

export class ModelRegistryService {
  private registry: AIModelDefinition[];

  constructor(initialRegistry: AIModelDefinition[] = MODEL_REGISTRY) {
    this.registry = [...initialRegistry];
  }

  public getActiveModels(): AIModelDefinition[] {
    return this.registry.filter((m) => m.status === 'active');
  }

  public getModel(modelId: string): AIModelDefinition | undefined {
    return this.registry.find((m) => m.model === modelId);
  }

  public getModelsByProvider(provider: AIProviderId): AIModelDefinition[] {
    return this.registry.filter((m) => m.provider === provider && m.status === 'active');
  }

  public getModelsByCapability(capability: AIModelCapability): AIModelDefinition[] {
    return this.registry.filter((m) => m.status === 'active' && m.capabilities.includes(capability));
  }

  public updateModelStatus(modelId: string, status: 'active' | 'deprecated' | 'disabled'): boolean {
    const model = this.registry.find((m) => m.model === modelId);
    if (!model) return false;
    model.status = status;
    return true;
  }

  public registerModel(modelDef: AIModelDefinition): void {
    const idx = this.registry.findIndex((m) => m.model === modelDef.model);
    if (idx >= 0) {
      this.registry[idx] = modelDef;
    } else {
      this.registry.push(modelDef);
    }
  }
}

export const defaultModelRegistry = new ModelRegistryService();
