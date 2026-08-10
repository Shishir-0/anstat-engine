import { Organization, User } from '../types/tenant';
import { Client } from '../types/client';
import { ProposalDocument } from '../types/proposal';
import { Repository, PullRequest } from '../types/github';
import { SecurityScan, SecurityFinding } from '../types/security';
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
    autofix: {
      isEligible: true,
    },
    auditHistory: [
      { id: 'ah_1', timestamp: '2026-02-09T18:00:14Z', action: 'finding.detected', actor: 'ANSTAT SAST Scanner' },
    ],
  },
  {
    id: 'find_secret_02',
    organizationId: 'org_anstat_01',
    scanId: 'scan_sec_01',
    repositoryId: 'repo_northstar_web_01',
    repositoryName: 'northstar-web-platform',
    title: 'Hardcoded Mock Token Pattern in Test Utility',
    description: 'Static JWT token string committed in client-side mock file.',
    severity: 'medium',
    confidence: 'high',
    category: 'secrets',
    status: 'open',
    file: 'lib/services/mock/mock-auth.service.ts',
    line: 18,
    cwe: 'CWE-798',
    owasp: 'OWASP A07:2021-Identification and Authentication Failures',
    evidence: {
      file: 'lib/services/mock/mock-auth.service.ts',
      line: 18,
      snippet: 'token: "mock-jwt-token-anstat-dev"',
      lineHighlight: 'token: "mock-jwt-token-anstat-dev"',
    },
    impact: 'Exposed secret patterns increase risk of accidental deployment to production.',
    recommendation: 'Read secrets strictly from process.env environment variables.',
    affectedComponent: 'Mock Auth Service',
    detectedAt: '2026-02-09T18:00:14Z',
    createdAt: '2026-02-09T18:00:14Z',
    updatedAt: '2026-02-09T18:00:14Z',
    autofix: {
      isEligible: true,
    },
    auditHistory: [
      { id: 'ah_2', timestamp: '2026-02-09T18:00:14Z', action: 'finding.detected', actor: 'ANSTAT Secret Scanner' },
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
    totalFindings: 2,
    criticalCount: 0,
    highCount: 1,
    mediumCount: 1,
    lowCount: 0,
    riskScore: 24,
    durationSeconds: 14,
    isDemoScan: true,
    scannerSummary: 'SAST & Dependency scan completed for northstar-web-platform main branch.',
    createdAt: '2026-02-09T18:00:00Z',
    updatedAt: '2026-02-09T18:00:14Z',
    findings: MOCK_SECURITY_FINDINGS,
  },
];

export const MOCK_JOBS: Job[] = [];
export const MOCK_DEPLOYMENTS: Deployment[] = [];
export const MOCK_AUDIT_EVENTS: AuditEvent[] = [];
export const MOCK_BUDGET_STATUS: BudgetStatus = { monthlyBudgetUsd: 2500, usedUsd: 642.5, remainingUsd: 1857.5, percentUsed: 25.7, alertLevel: 'normal' };
export const MOCK_USAGE_RECORDS: UsageRecord[] = [];
