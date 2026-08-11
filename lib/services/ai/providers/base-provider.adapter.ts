import {
  AIModelDefinition,
  AIProviderId,
  AIRequest,
  AIResponse,
  ProviderHealth,
} from '../../../types/ai-provider';

export abstract class BaseProviderAdapter {
  abstract readonly providerId: AIProviderId;

  abstract isAvailable(): boolean;

  abstract healthCheck(): Promise<ProviderHealth>;

  abstract generate(request: AIRequest, modelDef: AIModelDefinition): Promise<AIResponse>;
}
