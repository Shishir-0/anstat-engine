export type AIProviderId = 'google' | 'anthropic' | 'openai' | 'mock';

export type AIModelStatus = 'active' | 'deprecated' | 'disabled';

export type AIModelCapability =
  | 'text_generation'
  | 'code_generation'
  | 'code_review'
  | 'debugging'
  | 'reasoning'
  | 'structured_output'
  | 'long_context'
  | 'security_analysis'
  | 'fast_response';

export type AIOperation =
  | 'proposal_generation'
  | 'proposal_revision'
  | 'code_generation'
  | 'code_review'
  | 'security_analysis'
  | 'debug_root_cause'
  | 'debug_remediation'
  | 'debug_patch'
  | 'repository_analysis'
  | 'general_assistant';

export type AIComplexity = 'low' | 'medium' | 'high' | 'critical';

export type AIInvocationStatus =
  | 'REQUESTED'
  | 'AUTHORIZED'
  | 'RESERVED'
  | 'EXECUTING'
  | 'SUCCEEDED'
  | 'SETTLED'
  | 'FAILED'
  | 'RELEASED'
  | 'RECONCILED';

export interface AIRequest {
  requestId?: string;
  organizationId: string;
  userId: string;
  operation: AIOperation;
  prompt: string;
  systemPrompt?: string;
  context?: Record<string, unknown>;
  requestedCapability?: AIModelCapability;
  complexity?: AIComplexity;
  maxCredits?: number;
  preferredProvider?: AIProviderId;
  preferredModel?: string;
  metadata?: Record<string, unknown>;
}

export interface AIResponse {
  requestId: string;
  provider: AIProviderId;
  model: string;
  content: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  providerCost: number;
  aiCreditsConsumed: number;
  latencyMs: number;
  fallbackUsed: boolean;
  status: AIInvocationStatus;
  usageRecordId?: string;
  invocationRecordId?: string;
}

export type AIProviderErrorCode =
  | 'PERMISSION_DENIED'
  | 'SUBSCRIPTION_EXPIRED'
  | 'AI_CREDIT_LIMIT_REACHED'
  | 'RESOURCE_LIMIT_REACHED'
  | 'INVALID_AMOUNT'
  | 'INVALID_RESOURCE'
  | 'AI_PROVIDER_UNAVAILABLE'
  | 'MODEL_NOT_FOUND'
  | 'CONFIGURATION_ERROR'
  | 'RATE_LIMITED'
  | 'UNKNOWN_ERROR';

export interface AIProviderError {
  provider: AIProviderId;
  model?: string;
  code: AIProviderErrorCode;
  retryable: boolean;
  message: string;
}

export interface AIModelDefinition {
  provider: AIProviderId;
  model: string;
  displayName: string;
  capabilities: AIModelCapability[];
  contextWindow: number;
  inputCostPerMillionTokens: number;
  outputCostPerMillionTokens: number;
  status: AIModelStatus;
  priority: number;
  minComplexity?: AIComplexity;
  maxComplexity?: AIComplexity;
}

export interface CostEstimate {
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedProviderCostUSD: number;
  estimatedCredits: number;
}

export interface ProviderHealth {
  provider: AIProviderId;
  status: 'available' | 'degraded' | 'unavailable';
  lastCheckedAt: string;
  errorMessage?: string;
}
