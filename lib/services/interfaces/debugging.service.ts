import { DebugSessionInput, DebugAnalysisResult } from '../../types/debug';
import { Job } from '../../types/job';
import { PaginatedResult, PaginationParams } from '../../types/common';

export interface DebuggingService {
  listSessions(params?: PaginationParams): Promise<PaginatedResult<DebugAnalysisResult>>;
  getSessionById(id: string): Promise<DebugAnalysisResult | null>;
  analyzeError(input: DebugSessionInput): Promise<{ session: DebugAnalysisResult; job: Job }>;
  applyPatch(sessionId: string): Promise<{ job: Job; prNumber?: number }>;
}
