import { Organization, User } from '../types/tenant';
import { Client } from '../types/client';
import { ProposalDocument } from '../types/proposal';
import { Repository, PullRequest } from '../types/github';
import { SecurityScan, SecurityFinding } from '../types/security';
import { Incident } from '../types/debugging';
import { Job } from '../types/job';
import { Deployment } from '../types/deployment';
import { AuditEvent } from '../types/audit';
import { UsageRecord, BudgetStatus } from '../types/usage';
import { AIModel } from '../types/ai-model';

export const MOCK_ORGANIZATION: Organization = {
  id: 'org_anstat_01',
  name: 'Northstar Software Studio',
  slug: 'northstar-studio',
  logoUrl: '/logo.svg',
  brandColors: { primary: '#059669', secondary: '#0F172A' },
  rateCard: { developerHourlyRate: 125, seniorHourlyRate: 175, architectHourlyRate: 225, currency: 'USD' },
  githubAppConnected: true,
  githubOrgName: 'northstar-studio',
  plan: 'agency',
  monthlyAiBudget: 2500,
  createdAt: '2025-01-15T08:00:00Z',
  updatedAt: '2026-02-01T10:00:00Z',
};

export const MOCK_USER: User = {
  id: 'user_shishir_01',
  name: 'Shishir Kumar',
  email: 'shishir@northstarstudio.dev',
  role: 'owner',
  organizationId: 'org_anstat_01',
  createdAt: '2025-01-15T08:00:00Z',
  twoFactorEnabled: true,
};

export const MOCK_AI_MODELS: AIModel[] = [
  {
    id: 'claude-3-5-sonnet',
    provider: 'anthropic',
    name: 'Claude 3.5 Sonnet',
    version: '20241022',
    contextWindow: 200000,
    capabilities: ['proposal_generation', 'code_generation', 'security_analysis', 'debugging', 'doc_synthesis'],
    costPer1kTokens: { input: 0.003, output: 0.015 },
    isDefault: true,
    status: 'active',
  },
];

export const MOCK_CLIENTS: Client[] = [];
export const MOCK_PROPOSALS: ProposalDocument[] = [];

export const MOCK_REPOSITORIES: Repository[] = [
  {
    id: 'repo_northstar_web_01',
    organizationId: 'org_anstat_01',
    name: 'northstar-web-platform',
    fullName: 'northstar-studio/northstar-web-platform',
    owner: 'northstar-studio',
    description: 'Core Next.js customer portal and delivery web interface.',
    defaultBranch: 'main',
    isPrivate: true,
    language: 'TypeScript',
    stargazersCount: 42,
    openIssuesCount: 4,
    securityScore: 82,
    lastScannedAt: '2026-02-09T18:00:00Z',
    connectedAt: '2025-01-20T00:00:00Z',
    status: 'active',
    createdAt: '2025-01-20T00:00:00Z',
    updatedAt: '2026-02-09T18:00:00Z',
  },
];

export const MOCK_PULL_REQUESTS: PullRequest[] = [];

export const MOCK_SECURITY_FINDINGS: SecurityFinding[] = [
  {
    id: 'find_csrf_01',
    organizationId: 'org_anstat_01',
    scanId: 'scan_sec_01',
    repositoryId: 'repo_northstar_web_01',
    repositoryName: 'northstar-web-platform',
    title: 'Missing CSRF Guard on Mutation Endpoint',
    description: 'The API endpoint accepts state-changing POST requests without verifying anti-CSRF headers.',
    severity: 'high',
    confidence: 'high',
    category: 'csrf',
    status: 'open',
    file: 'app/api/workspace/update/route.ts',
    line: 34,
    cwe: 'CWE-352',
    owasp: 'OWASP A01:2021-Broken Access Control',
    evidence: {
      file: 'app/api/workspace/update/route.ts',
      line: 34,
      snippet: 'export async function POST(req: Request) {\n  const body = await req.json();\n  return updateWorkspace(body);\n}',
      lineHighlight: 'const body = await req.json();',
    },
    impact: 'An attacker could trick an authenticated admin into executing unauthorized state changes.',
    whyItMatters: 'Cross-Site Request Forgery permits unauthorized state mutations when session cookies sent automatically.',
    recommendation: 'Validate X-Requested-With header or anti-CSRF token on all POST/PUT/DELETE handlers.',
    affectedComponent: 'Workspace Management API Handler',
    detectedAt: '2026-02-09T18:00:14Z',
    createdAt: '2026-02-09T18:00:14Z',
    updatedAt: '2026-02-09T18:00:14Z',
    autofix: { isEligible: true },
    auditHistory: [
      { id: 'ah_1', timestamp: '2026-02-09T18:00:14Z', action: 'finding.detected', actor: 'ANSTAT SAST Scanner' },
    ],
  },
];

export const MOCK_SECURITY_SCANS: SecurityScan[] = [
  {
    id: 'scan_sec_01',
    organizationId: 'org_anstat_01',
    repositoryId: 'repo_northstar_web_01',
    repositoryName: 'northstar-web-platform',
    branch: 'main',
    profile: 'strict',
    scanType: 'standard',
    status: 'completed',
    totalFindings: 1,
    criticalCount: 0,
    highCount: 1,
    mediumCount: 0,
    lowCount: 0,
    riskScore: 24,
    durationSeconds: 14,
    isDemoScan: true,
    scannerSummary: 'SAST & Dependency scan completed clean.',
    createdAt: '2026-02-09T18:00:00Z',
    updatedAt: '2026-02-09T18:00:14Z',
    findings: MOCK_SECURITY_FINDINGS,
  },
];

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'inc_104',
    organizationId: 'org_anstat_01',
    repositoryId: 'repo_northstar_web_01',
    repositoryName: 'northstar-web-platform',
    environment: 'staging',
    title: 'Admin dashboard returning 403 Forbidden on workspace settings load',
    description: 'Authenticated admin users receive HTTP 403 errors when requesting workspace role permissions.',
    severity: 'high',
    status: 'open',
    source: 'auth_error',
    errorType: 'ForbiddenError',
    lastSeenAt: '2026-02-10T14:32:00Z',
    occurrenceCount: 142,
    affectedUsersCount: 18,
    affectedServices: ['auth-service', 'workspace-api'],
    signals: [
      {
        id: 'sig_01',
        source: 'auth_error',
        timestamp: '2026-02-10T14:32:00Z',
        errorType: 'ForbiddenError',
        message: 'AccessDenied: Insufficient permission claim for scope: workspace.read',
        environment: 'staging',
        confidence: 95,
        stackTrace: [
          { id: 'st_1', file: 'src/auth/middleware.ts', line: 42, functionName: 'verifyWorkspaceScope', isAppCode: true },
          { id: 'st_2', file: 'src/admin/routes.ts', line: 18, functionName: 'getWorkspaceSettingsHandler', isAppCode: true },
        ],
        logs: [
          { id: 'log_1', timestamp: '2026-02-10T14:32:00.124Z', level: 'ERROR', service: 'auth-service', message: 'Token claim validation failed for org_anstat_01' },
          { id: 'log_2', timestamp: '2026-02-10T14:32:00.130Z', level: 'WARN', service: 'workspace-api', message: 'HTTP 403 response sent to user_shishir_01' },
        ],
      },
    ],
    hypotheses: [
      {
        id: 'hyp_01',
        title: 'Authorization Middleware Scope Mismatch',
        explanation: 'Authorization middleware checks role claim before validating session token scope.',
        confidenceScore: 92,
        affectedFiles: ['src/auth/middleware.ts'],
        evidenceIds: ['sig_01'],
        evidenceSummary: 'Stack frame src/auth/middleware.ts:42 explicitly throws ForbiddenError.',
        impact: 'Admin portal settings requests fail with 403 for authenticated owners.',
        contributingFactors: ['Recent refactor of role permissions in commit a81f3d2.'],
        isWorkingHypothesis: true,
      },
      {
        id: 'hyp_02',
        title: 'Expired JWT Token Claims',
        explanation: 'Client-side auth token is missing refresh mechanism.',
        confidenceScore: 35,
        affectedFiles: ['lib/services/mock/mock-auth.service.ts'],
        evidenceIds: ['sig_01'],
        evidenceSummary: 'Token expiration timestamp passed.',
        impact: 'Requires re-login.',
        contributingFactors: ['Session duration set to 1 hour.'],
      },
    ],
    timeline: [
      { id: 'tl_1', timestamp: '2026-02-10T14:32:00Z', stage: 'detection', title: 'Incident Signal Detected', description: 'HTTP 403 error spike reported in staging.', actor: 'ANSTAT Incident Telemetry' },
      { id: 'tl_2', timestamp: '2026-02-10T14:32:04Z', stage: 'correlation', title: 'Signals Correlated', description: 'Matched stack trace to src/auth/middleware.ts.', actor: 'ANSTAT Context Builder' },
    ],
    estimatedCostUsd: 0.45,
    attempts: 1,
    createdAt: '2026-02-10T14:32:00Z',
    updatedAt: '2026-02-10T14:32:04Z',
  },
];

export const MOCK_JOBS: Job[] = [];
export const MOCK_DEPLOYMENTS: Deployment[] = [];
export const MOCK_AUDIT_EVENTS: AuditEvent[] = [];
export const MOCK_BUDGET_STATUS: BudgetStatus = { monthlyBudgetUsd: 2500, usedUsd: 642.5, remainingUsd: 1857.5, percentUsed: 25.7, alertLevel: 'normal' };
export const MOCK_USAGE_RECORDS: UsageRecord[] = [];
