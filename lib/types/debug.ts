import { BaseEntity } from './common';

export interface StackFrame {
  file: string;
  line: number;
  column?: number;
  functionName?: string;
  snippet?: string;
}

export interface DebugSessionInput {
  repositoryId?: string;
  environment: 'development' | 'staging' | 'production';
  errorMessage: string;
  stackTrace?: string;
  logs?: string;
  codeSnippet?: string;
}

export interface DebugAnalysisResult extends BaseEntity {
  jobId: string;
  problemSummary: string;
  rootCause: string;
  evidence: string[];
  potentialCauses: string[];
  recommendedFix: string;
  proposedPatch?: string;
  testingSteps: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  isSimulated: boolean;
}
