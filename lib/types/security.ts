import { BaseEntity } from './common';
import { CodePatch } from './code';

export type SecuritySeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type SecurityConfidence = 'high' | 'medium' | 'low';
export type SecurityCategory =
  | 'secrets'
  | 'authentication'
  | 'authorization'
  | 'injection'
  | 'xss'
  | 'csrf'
  | 'dependencies'
  | 'configuration'
  | 'cryptography'
  | 'data_exposure'
  | 'input_validation'
  | 'access_control';

export type FindingStatus =
  | 'open'
  | 'triaged'
  | 'fix_proposed'
  | 'validating'
  | 'rescan_pending'
  | 'resolved'
  | 'accepted_risk'
  | 'false_positive';

export interface SecurityEvidence {
  file: string;
  line: number;
  snippet: string;
  lineHighlight?: string;
}

export interface FindingResolution {
  type: 'autofix' | 'manual_fix' | 'accepted_risk' | 'false_positive';
  reason?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  expiresAt?: string;
}

export interface AutofixPipeline {
  isEligible: boolean;
  ineligibilityReason?: string;
  plan?: {
    summary: string;
    plannedFix: string;
    affectedFiles: string[];
    potentialSideEffects: string;
  };
  patch?: CodePatch;
  validationPassed?: boolean;
  isRescanned?: boolean;
  rescanResult?: 'clean' | 'still_present' | 'new_finding_introduced';
  rescanMessage?: string;
}

export interface FindingAuditHistory {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  notes?: string;
}

export interface SecurityFinding extends BaseEntity {
  scanId: string;
  repositoryId: string;
  repositoryName: string;
  title: string;
  description: string;
  severity: SecuritySeverity;
  confidence: SecurityConfidence;
  category: SecurityCategory;
  status: FindingStatus;
  file: string;
  line: number;
  column?: number;
  cwe?: string;
  owasp?: string;
  evidence: SecurityEvidence;
  impact: string;
  whyItMatters?: string;
  recommendation: string;
  affectedComponent: string;
  detectedAt: string;
  resolvedAt?: string;
  resolution?: FindingResolution;
  autofix?: AutofixPipeline;
  auditHistory: FindingAuditHistory[];
  autofixPrNumber?: number;
  autofixPrUrl?: string;
}

export interface SecurityScan extends BaseEntity {
  repositoryId: string;
  repositoryName: string;
  branch: string;
  profile: 'standard' | 'strict' | 'deep';
  scanType: 'standard' | 'deep' | 'rescan';
  status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  riskScore: number;
  durationSeconds: number;
  isDemoScan: boolean;
  scannerSummary?: string;
  findings: SecurityFinding[];
}

export interface SecurityPostureSummary {
  riskScore: number; // 0 (Clean) - 100 (Critical)
  overallStatus: 'low' | 'medium' | 'high' | 'critical';
  totalFindings: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  resolvedCount: number;
  acceptedRiskCount: number;
  trendData: { date: string; riskScore: number; openCount: number }[];
}
