import {
  AIModelDefinition,
  AIRequest,
  AIModelCapability,
  AIProviderId,
  ProviderHealth,
} from '../../types/ai-provider';
import { ModelRegistryService, defaultModelRegistry } from './model-registry';
import { CostCalculator } from './cost-calculator';

export class ModelRouter {
  private registry: ModelRegistryService;

  constructor(registry: ModelRegistryService = defaultModelRegistry) {
    this.registry = registry;
  }

  /**
   * Derive required capability based on AIOperation if not explicitly specified.
   */
  private deriveCapability(request: AIRequest): AIModelCapability {
    if (request.requestedCapability) {
      return request.requestedCapability;
    }
    switch (request.operation) {
      case 'code_generation':
      case 'debug_patch':
        return 'code_generation';
      case 'code_review':
        return 'code_review';
      case 'security_analysis':
        return 'security_analysis';
      case 'debug_root_cause':
      case 'debug_remediation':
        return 'debugging';
      case 'repository_analysis':
        return 'long_context';
      case 'proposal_generation':
      case 'proposal_revision':
      case 'general_assistant':
      default:
        return 'text_generation';
    }
  }

  /**
   * Select candidate models using CAPABILITY-FIRST, COST-SECOND routing strategy.
   */
  public selectCandidates(
    request: AIRequest,
    availableCredits: number,
    providerHealthMap?: Map<AIProviderId, ProviderHealth>
  ): AIModelDefinition[] {
    const activeModels = this.registry.getActiveModels();
    const capability = this.deriveCapability(request);

    // 1. Capability Filtering
    let candidates = activeModels.filter((model) => model.capabilities.includes(capability));

    // Fallback: If no model has exact specific capability, fall back to text_generation
    if (candidates.length === 0) {
      candidates = activeModels.filter((model) => model.capabilities.includes('text_generation'));
    }

    // 2. Health Filtering (Exclude unavailable providers)
    if (providerHealthMap) {
      candidates = candidates.filter((model) => {
        const health = providerHealthMap.get(model.provider);
        return !health || health.status !== 'unavailable';
      });
    }

    // 3. Preferred Provider Filtering (if requested and healthy)
    if (request.preferredProvider) {
      const prefCandidates = candidates.filter((m) => m.provider === request.preferredProvider);
      if (prefCandidates.length > 0) {
        candidates = prefCandidates;
      }
    }

    // 4. Preferred Model Filtering (if explicitly requested)
    if (request.preferredModel) {
      const exactModel = candidates.find((m) => m.model === request.preferredModel);
      if (exactModel) {
        // Return exact requested model if affordable
        const est = CostCalculator.estimateCost(request, exactModel);
        if (est.estimatedCredits <= availableCredits) {
          return [exactModel];
        }
      }
    }

    // 5. Affordability Filtering
    candidates = candidates.filter((model) => {
      const estimate = CostCalculator.estimateCost(request, model);
      return estimate.estimatedCredits <= availableCredits;
    });

    if (candidates.length === 0) {
      return [];
    }

    // 6. Capability-First, Cost-Second Sorting:
    // Primary: Match complexity tier if specified
    // Secondary: Lowest estimated provider cost (cheapest capable model first)
    // Tertiary: Priority rank
    candidates.sort((a, b) => {
      const estA = CostCalculator.estimateCost(request, a);
      const estB = CostCalculator.estimateCost(request, b);

      if (estA.estimatedCredits !== estB.estimatedCredits) {
        return estA.estimatedCredits - estB.estimatedCredits;
      }
      return a.priority - b.priority;
    });

    return candidates;
  }

  /**
   * Select the optimal single model for the request.
   */
  public route(
    request: AIRequest,
    availableCredits: number,
    providerHealthMap?: Map<AIProviderId, ProviderHealth>
  ): AIModelDefinition | null {
    const candidates = this.selectCandidates(request, availableCredits, providerHealthMap);
    return candidates.length > 0 ? candidates[0] : null;
  }
}
