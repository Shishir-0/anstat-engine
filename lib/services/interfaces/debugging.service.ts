import {
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentSource,
  RootCauseHypothesis,
  RemediationPlan,
} from '../../types/debugging';
import { PaginatedResult, PaginationParams } from '../../types/common';

export interface IncidentFilters extends PaginationParams {
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  source?: IncidentSource;
  repositoryId?: string;
  environment?: string;
}

export interface DebuggingService {
  listIncidents(params?: IncidentFilters): Promise<PaginatedResult<Incident>>;
  getIncident(id: string): Promise<Incident | null>;
  createIncident(input: {
    repositoryId: string;
    repositoryName: string;
    environment: 'production' | 'staging' | 'development';
    title: string;
    description: string;
    severity: IncidentSeverity;
    source: IncidentSource;
    errorType: string;
    rawStackTrace?: string;
    rawLogs?: string;
  }): Promise<Incident>;

  analyzeRootCause(incidentId: string): Promise<Incident>;
  selectHypothesis(incidentId: string, hypothesisId: string): Promise<Incident>;
  generateRemediationPlan(incidentId: string): Promise<Incident>;
  approvePlan(incidentId: string): Promise<Incident>;
  requestPlanChanges(incidentId: string, feedback: string): Promise<Incident>;
  generatePatch(incidentId: string): Promise<Incident>;
  validatePatch(incidentId: string): Promise<Incident>;
  runSecurityReview(incidentId: string): Promise<Incident>;
  verifyRegression(incidentId: string): Promise<{ incident: Incident; outcome: 'resolved' | 'still_reproduces' }>;
  createPullRequest(incidentId: string): Promise<Incident>;
  reopenIncident(incidentId: string): Promise<Incident>;
  cancelInvestigation(incidentId: string): Promise<Incident>;
  retryInvestigation(incidentId: string): Promise<Incident>;
}
