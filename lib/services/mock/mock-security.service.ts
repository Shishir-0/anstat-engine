import { SecurityService, FindingFilters } from '../interfaces/security.service';
import {
  SecurityScan,
  SecurityFinding,
  SecurityPostureSummary,
  FindingStatus,
} from '../../types/security';
import { PaginatedResult, PaginationParams } from '../../types/common';
import { MOCK_SECURITY_SCANS, MOCK_SECURITY_FINDINGS } from '../../mock/seed-data';

export class MockSecurityService implements SecurityService {
  private scans: SecurityScan[] = [...MOCK_SECURITY_SCANS];
  private findings: SecurityFinding[] = [...MOCK_SECURITY_FINDINGS];

  async listScans(params?: PaginationParams): Promise<PaginatedResult<SecurityScan>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;

    return {
      data: this.scans.slice(start, start + limit),
      total: this.scans.length,
      page,
      limit,
      totalPages: Math.ceil(this.scans.length / limit) || 1,
    };
  }

  async getScan(id: string): Promise<SecurityScan | null> {
    return this.scans.find(s => s.id === id) || null;
  }

  async runScan(input: { repositoryId: string; repositoryName: string; branch: string; profile: 'standard' | 'strict' | 'deep' }): Promise<SecurityScan> {
    const newScan: SecurityScan = {
      id: `scan_${Date.now()}`,
      organizationId: 'org_anstat_01',
      repositoryId: input.repositoryId,
      repositoryName: input.repositoryName,
      branch: input.branch,
      profile: input.profile,
      scanType: 'standard',
      status: 'completed',
      totalFindings: 2,
      criticalCount: 0,
      highCount: 1,
      mediumCount: 1,
      lowCount: 0,
      riskScore: 24,
      durationSeconds: 12,
      isDemoScan: true,
      scannerSummary: `Simulated ${input.profile.toUpperCase()} security scan completed clean.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      findings: this.findings,
    };

    this.scans.unshift(newScan);
    return newScan;
  }

  async listFindings(params?: FindingFilters): Promise<PaginatedResult<SecurityFinding>> {
    let filtered = [...this.findings];

    if (params?.severity) {
      filtered = filtered.filter(f => f.severity === params.severity);
    }
    if (params?.status) {
      filtered = filtered.filter(f => f.status === params.status);
    }
    if (params?.category) {
      filtered = filtered.filter(f => f.category === params.category);
    }
    if (params?.repositoryId) {
      filtered = filtered.filter(f => f.repositoryId === params.repositoryId);
    }
    if (params?.query) {
      const q = params.query.toLowerCase();
      filtered = filtered.filter(
        f =>
          f.title.toLowerCase().includes(q) ||
          f.file.toLowerCase().includes(q) ||
          (f.cwe && f.cwe.toLowerCase().includes(q))
      );
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;

    return {
      data: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit) || 1,
    };
  }

  async getFinding(id: string): Promise<SecurityFinding | null> {
    return this.findings.find(f => f.id === id) || null;
  }

  async explainFinding(id: string): Promise<{ summary: string; rootCause: string; attackSurface: string; impact: string; recommendation: string }> {
    const finding = await this.getFinding(id);
    return {
      summary: finding?.title || 'Security Finding Explanation',
      rootCause: finding?.whyItMatters || 'Missing explicit validation check on input parameter.',
      attackSurface: 'Public HTTP API endpoint exposed to unauthenticated client requests.',
      impact: finding?.impact || 'Potential unauthorized state mutation or data exposure.',
      recommendation: finding?.recommendation || 'Enforce authorization boundary middleware.',
    };
  }

  async generateAutofixPlan(findingId: string): Promise<SecurityFinding> {
    const finding = await this.getFinding(findingId);
    if (!finding) throw new Error('Finding not found');

    finding.status = 'fix_proposed';
    finding.autofix = {
      isEligible: true,
      plan: {
        summary: `Autofix remediation plan for ${finding.title}`,
        plannedFix: 'Add checkPermission authorization middleware and validate anti-CSRF headers.',
        affectedFiles: [finding.file],
        potentialSideEffects: 'None. Preserves existing request handler signature.',
      },
    };
    finding.auditHistory.unshift({
      id: `ah_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'autofix.plan_generated',
      actor: 'ANSTAT AI Autofix Engine',
    });
    return finding;
  }

  async generateAutofixPatch(findingId: string): Promise<SecurityFinding> {
    const finding = await this.getFinding(findingId);
    if (!finding) throw new Error('Finding not found');

    if (finding.autofix) {
      finding.autofix.patch = {
        id: `patch_fix_${Date.now()}`,
        filesChangedCount: 1,
        additions: 12,
        deletions: 2,
        fileDiffs: [
          {
            id: 'fd_fix_1',
            file: finding.file,
            status: 'modified',
            additions: 12,
            deletions: 2,
            aiExplanation: 'Adds CSRF header verification check before processing POST request body.',
            riskLevel: 'low',
            confidenceScore: 98,
            chunks: [
              {
                oldStart: 30,
                oldLines: 4,
                newStart: 30,
                newLines: 8,
                lines: [
                  '  export async function POST(req: Request) {',
                  '+   const csrfToken = req.headers.get("x-csrf-token");',
                  '+   if (!csrfToken) return new Response("Forbidden: Missing CSRF", { status: 403 });',
                  '-   const body = await req.json();',
                  '+   const body = await req.json();',
                ],
              },
            ],
          },
        ],
        createdAt: new Date().toISOString(),
      };
    }
    return finding;
  }

  async validateAutofix(findingId: string): Promise<SecurityFinding> {
    const finding = await this.getFinding(findingId);
    if (!finding) throw new Error('Finding not found');

    if (finding.autofix) {
      finding.status = 'rescan_pending';
      finding.autofix.validationPassed = true;
    }
    return finding;
  }

  async rescanFinding(findingId: string): Promise<{ finding: SecurityFinding; outcome: 'clean' | 'still_present' | 'new_finding_introduced' }> {
    const finding = await this.getFinding(findingId);
    if (!finding) throw new Error('Finding not found');

    const outcome: 'clean' | 'still_present' | 'new_finding_introduced' = 'clean';

    if (outcome === 'clean') {
      finding.status = 'resolved';
      finding.resolvedAt = new Date().toISOString();
      finding.resolution = {
        type: 'autofix',
        resolvedBy: 'ANSTAT Security Rescan',
        resolvedAt: new Date().toISOString(),
      };
      if (finding.autofix) {
        finding.autofix.isRescanned = true;
        finding.autofix.rescanResult = 'clean';
        finding.autofix.rescanMessage = 'Simulated rescan verified vulnerability is clean and resolved.';
      }
      finding.auditHistory.unshift({
        id: `ah_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'finding.resolved_by_rescan',
        actor: 'ANSTAT Rescan Engine',
      });
    }

    return { finding, outcome };
  }

  async acceptRisk(findingId: string, reason: string, expiresAt?: string): Promise<SecurityFinding> {
    const finding = await this.getFinding(findingId);
    if (!finding) throw new Error('Finding not found');

    finding.status = 'accepted_risk';
    finding.resolution = {
      type: 'accepted_risk',
      reason,
      expiresAt: expiresAt || '2026-12-31',
      resolvedBy: 'Shishir Kumar',
      resolvedAt: new Date().toISOString(),
    };
    finding.auditHistory.unshift({
      id: `ah_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'finding.accepted_risk',
      actor: 'Shishir Kumar',
      notes: reason,
    });
    return finding;
  }

  async markFalsePositive(findingId: string, reason: string): Promise<SecurityFinding> {
    const finding = await this.getFinding(findingId);
    if (!finding) throw new Error('Finding not found');

    finding.status = 'false_positive';
    finding.resolution = {
      type: 'false_positive',
      reason,
      resolvedBy: 'Shishir Kumar',
      resolvedAt: new Date().toISOString(),
    };
    finding.auditHistory.unshift({
      id: `ah_${Date.now()}`,
      timestamp: new Date().toISOString(),
      action: 'finding.false_positive',
      actor: 'Shishir Kumar',
      notes: reason,
    });
    return finding;
  }

  async getPostureSummary(): Promise<SecurityPostureSummary> {
    return {
      riskScore: 24,
      overallStatus: 'low',
      totalFindings: this.findings.length,
      criticalCount: this.findings.filter(f => f.severity === 'critical').length,
      highCount: this.findings.filter(f => f.severity === 'high').length,
      mediumCount: this.findings.filter(f => f.severity === 'medium').length,
      lowCount: this.findings.filter(f => f.severity === 'low').length,
      resolvedCount: this.findings.filter(f => f.status === 'resolved').length,
      acceptedRiskCount: this.findings.filter(f => f.status === 'accepted_risk').length,
      trendData: [
        { date: '2026-02-01', riskScore: 45, openCount: 5 },
        { date: '2026-02-05', riskScore: 32, openCount: 3 },
        { date: '2026-02-09', riskScore: 24, openCount: 2 },
      ],
    };
  }
}
