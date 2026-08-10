export type AIProvider = 'anthropic' | 'openai' | 'google' | 'mistral' | 'anstat_native';

export type ModelCapability =
  | 'proposal_generation'
  | 'code_generation'
  | 'security_analysis'
  | 'debugging'
  | 'doc_synthesis';

export interface AIModel {
  id: string;
  provider: AIProvider;
  name: string;
  version: string;
  contextWindow: number; // e.g. 128000 or 200000
  capabilities: ModelCapability[];
  costPer1kTokens: {
    input: number;
    output: number;
  };
  isDefault?: boolean;
  status: 'active' | 'deprecated' | 'beta';
}

export interface WorkspaceAIConfig {
  defaultProposalModelId: string;
  defaultCodeModelId: string;
  defaultSecurityModelId: string;
  defaultDebugModelId: string;
  safetyMode: 'strict' | 'standard' | 'permissive';
  maxDailyTokenLimit: number;
}
