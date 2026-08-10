import {
  SecurityScan,
  SecurityFinding,
  SecurityPostureSummary,
  SecuritySeverity,
  FindingStatus,
  SecurityCategory,
} from '../../types/security';
import { PaginatedResult, PaginationParams } from '../../types/common';

export interface FindingFilters extends PaginationParams {
  severity?: SecuritySeverity;
  status?: FindingStatus;
  category?: SecurityCategory;
  repositoryId?: string;
}

export interface SecurityService {
  listScans(params?: PaginationParams): Promise<PaginatedResult<SecurityScan>>;
  getScan(id: string): Promise<SecurityScan | null>;
  runScan(input: { repositoryId: string; repositoryName: string; branch: string; profile: 'standard' | 'strict' | 'deep' }): Promise<SecurityScan>;
  
  listFindings(params?: FindingFilters): Promise<PaginatedResult<SecurityFinding>>;
  getFinding(id: string): Promise<SecurityFinding | null>;
  explainFinding(id: string): Promise<{ summary: string; rootCause: string; attackSurface: string; impact: string; recommendation: string }>;
  
  generateAutofixPlan(findingId: string): Promise<SecurityFinding>;
  generateAutofixPatch(findingId: string): Promise<SecurityFinding>;
  validateAutofix(findingId: string): Promise<SecurityFinding>;
  rescanFinding(findingId: string): Promise<{ finding: SecurityFinding; outcome: 'clean' | 'still_present' | 'new_finding_introduced' }>;
  
  acceptRisk(findingId: string, reason: string, expiresAt?: string): Promise<SecurityFinding>;
  markFalsePositive(findingId: string, reason: string): Promise<SecurityFinding>;
  getPostureSummary(): Promise<SecurityPostureSummary>;
}
