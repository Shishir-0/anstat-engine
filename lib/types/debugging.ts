import { BaseEntity } from './common';
import { SecuritySeverity, SecurityFinding } from './security';
import { CodePatch, ValidationResult } from './code';

export type IncidentSeverity = SecuritySeverity;

export type IncidentStatus =
  | 'open'
  | 'investigating'
  | 'root_cause_identified'
  | 'fix_proposed'
  | 'validating'
  | 'security_review'
  | 'needs_review'
  | 'resolved'
  | 'closed'
  | 'reopened';

export type IncidentSource =
  | 'app_error'
  | 'api_error'
  | 'db_error'
  | 'auth_error'
  | 'performance'
  | 'infrastructure'
  | 'user_report';

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface StackFrame {
  id: string;
  file: string;
  line: number;
  column?: number;
  functionName: string;
  module?: string;
  codeSnippet?: string;
  isAppCode: boolean;
}

export interface LogEvent {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  requestId?: string;
  traceId?: string;
  metadata?: Record<string, unknown>;
}

export interface ErrorSignal {
  id: string;
  source: IncidentSource;
  timestamp: string;
  errorType: string;
  message: string;
  stackTrace?: StackFrame[];
  logs?: LogEvent[];
  requestId?: string;
  traceId?: string;
  environment: string;
  confidence: number; // 0 - 100
}

export interface RootCauseHypothesis {
  id: string;
  title: string;
  explanation: string;
  confidenceScore: number; // 0 - 100
  affectedFiles: string[];
  evidenceIds: string[];
  evidenceSummary: string;
  impact: string;
  contributingFactors: string[];
  isWorkingHypothesis?: boolean;
}

export interface RemediationPlan {
  id: string;
  summary: string;
  rootCause: string;
  plannedFix: string;
  affectedFiles: string[];
  expectedBehavior: string;
  sideEffects?: string;
  isApproved?: boolean;
  userFeedback?: string;
}

export interface RegressionCheck {
  status: 'resolved' | 'still_reproduces' | 'unable_to_verify';
  message: string;
  verifiedAt: string;
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  stage: string;
  title: string;
  description: string;
  actor: string;
}

export interface Incident extends BaseEntity {
  organizationId: string;
  repositoryId: string;
  repositoryName: string;
  environment: 'production' | 'staging' | 'development';
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  source: IncidentSource;
  errorType: string;
  lastSeenAt: string;
  occurrenceCount: number;
  affectedUsersCount: number;
  affectedServices: string[];
  signals: ErrorSignal[];
  hypotheses: RootCauseHypothesis[];
  selectedHypothesisId?: string;
  remediationPlan?: RemediationPlan;
  patch?: CodePatch;
  validationResult?: ValidationResult;
  securityFindings?: SecurityFinding[];
  regressionCheck?: RegressionCheck;
  timeline: IncidentTimelineEvent[];
  pullRequestNumber?: number;
  pullRequestUrl?: string;
  estimatedCostUsd: number;
  attempts: number;
}
