import { DebuggingService, IncidentFilters } from '../interfaces/debugging.service';
import { Incident, IncidentSeverity, IncidentStatus, IncidentSource } from '../../types/debugging';
import { PaginatedResult, PaginationParams } from '../../types/common';
import { MOCK_INCIDENTS } from '../../mock/seed-data';
import { getValidationService, getSecurityService, getCodeService, getGitHubService } from '../registry';

export class MockDebuggingService implements DebuggingService {
  private incidents: Incident[] = [...MOCK_INCIDENTS];

  async listIncidents(params?: IncidentFilters): Promise<PaginatedResult<Incident>> {
    let filtered = [...this.incidents];

    if (params?.severity) {
      filtered = filtered.filter(i => i.severity === params.severity);
    }
    if (params?.status) {
      filtered = filtered.filter(i => i.status === params.status);
    }
    if (params?.source) {
      filtered = filtered.filter(i => i.source === params.source);
    }
    if (params?.repositoryId) {
      filtered = filtered.filter(i => i.repositoryId === params.repositoryId);
    }
    if (params?.query) {
      const q = params.query.toLowerCase();
      filtered = filtered.filter(
        i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.errorType.toLowerCase().includes(q)
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

  async getIncident(id: string): Promise<Incident | null> {
    return this.incidents.find(i => i.id === id) || null;
  }

  async createIncident(input: {
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
  }): Promise<Incident> {
    const newInc: Incident = {
      id: `inc_${Date.now()}`,
      organizationId: 'org_anstat_01',
      repositoryId: input.repositoryId,
      repositoryName: input.repositoryName,
      environment: input.environment,
      title: input.title,
      description: input.description,
      severity: input.severity,
      status: 'investigating',
      source: input.source,
      errorType: input.errorType,
      lastSeenAt: new Date().toISOString(),
      occurrenceCount: 1,
      affectedUsersCount: 1,
      affectedServices: ['api-service'],
      signals: [
        {
          id: `sig_${Date.now()}`,
          source: input.source,
          timestamp: new Date().toISOString(),
          errorType: input.errorType,
          message: input.description,
          environment: input.environment,
          confidence: 90,
          stackTrace: [
            { id: 'st_1', file: 'src/auth/middleware.ts', line: 42, functionName: 'verifyWorkspaceScope', isAppCode: true },
          ],
          logs: [
            { id: 'log_1', timestamp: new Date().toISOString(), level: 'ERROR', service: 'auth-service', message: input.description },
          ],
        },
      ],
      hypotheses: [
        {
          id: `hyp_1`,
          title: 'Authorization Middleware Scope Mismatch',
          explanation: 'Middleware check evaluates role claims before verifying target scope permissions.',
          confidenceScore: 92,
          affectedFiles: ['src/auth/middleware.ts'],
          evidenceIds: ['sig_1'],
          evidenceSummary: 'Stack frame src/auth/middleware.ts:42 explicitly throws ForbiddenError.',
          impact: 'Requests fail with 403 status.',
          contributingFactors: ['Recent authorization refactor.'],
          isWorkingHypothesis: true,
        },
      ],
      timeline: [
        { id: `tl_1`, timestamp: new Date().toISOString(), stage: 'creation', title: 'Investigation Created', description: 'Manual investigation initialized.', actor: 'Shishir Kumar' },
      ],
      estimatedCostUsd: 0.35,
      attempts: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.incidents.unshift(newInc);
    return newInc;
  }

  async analyzeRootCause(incidentId: string): Promise<Incident> {
    const inc = await this.getIncident(incidentId);
    if (!inc) throw new Error('Incident not found');

    inc.status = 'root_cause_identified';
    inc.timeline.unshift({
      id: `tl_${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'analysis',
      title: 'Root Cause Hypothesis Synthesized',
      description: 'AI model identified root cause in src/auth/middleware.ts.',
      actor: 'ANSTAT AI Incident Engine',
    });
    return inc;
  }

  async selectHypothesis(incidentId: string, hypothesisId: string): Promise<Incident> {
    const inc = await this.getIncident(incidentId);
    if (!inc) throw new Error('Incident not found');

    inc.selectedHypothesisId = hypothesisId;
    return inc;
  }

  async generateRemediationPlan(incidentId: string): Promise<Incident> {
    const inc = await this.getIncident(incidentId);
    if (!inc) throw new Error('Incident not found');

    inc.status = 'fix_proposed';
    inc.remediationPlan = {
      id: `rem_${Date.now()}`,
      summary: `Remediation Plan for ${inc.title}`,
      rootCause: inc.hypotheses[0]?.explanation || 'Middleware scope validation error.',
      plannedFix: 'Update verifyWorkspaceScope middleware to check role permissions before enforcing session restrictions.',
      affectedFiles: ['src/auth/middleware.ts'],
      expectedBehavior: 'Authenticated admin portal requests return 200 OK.',
      sideEffects: 'None. Preserves existing session duration policy.',
      isApproved: false,
    };
    return inc;
  }

  async approvePlan(incidentId: string): Promise<Incident> {
    const inc = await this.getIncident(incidentId);
    if (!inc) throw new Error('Incident not found');

    if (inc.remediationPlan) {
      inc.remediationPlan.isApproved = true;
    }
    return inc;
  }

  async requestPlanChanges(incidentId: string, feedback: string): Promise<Incident> {
    const inc = await this.getIncident(incidentId);
    if (!inc) throw new Error('Incident not found');

    if (inc.remediationPlan) {
      inc.remediationPlan.userFeedback = feedback;
      inc.remediationPlan.plannedFix = `[Revised]: ${inc.remediationPlan.plannedFix} (Feedback: ${feedback})`;
    }
    return inc;
  }

  // DELEGATES patch generation to CodeService (Rule #2)
  async generatePatch(incidentId: string): Promise<Incident> {
    const inc = await this.getIncident(incidentId);
    if (!inc) throw new Error('Incident not found');

    const codeService = getCodeService();
    const codeJob = await codeService.generatePatch('job_code_01');
    inc.patch = codeJob.patch || {
      id: `patch_dbg_${Date.now()}`,
      filesChangedCount: 1,
      additions: 8,
      deletions: 2,
      fileDiffs: [
        {
          id: 'fd_dbg_1',
          file: 'src/auth/middleware.ts',
          status: 'modified',
          additions: 8,
          deletions: 2,
          aiExplanation: 'Validates workspace role permissions before scope check.',
          riskLevel: 'low',
          confidenceScore: 96,
          chunks: [
            {
              oldStart: 40,
              oldLines: 4,
              newStart: 40,
              newLines: 6,
              lines: [
                '  export function verifyWorkspaceScope(req: Request) {',
                '+   const userRole = req.headers.get("x-user-role");',
                '+   if (userRole === "owner" || userRole === "admin") return true;',
                '-   if (!req.headers.has("x-scope")) throw new ForbiddenError();',
                '+   if (!req.headers.has("x-scope")) throw new ForbiddenError();',
              ],
            },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
    };
    return inc;
  }

  // DELEGATES validation to ValidationService (Rule #3)
  async validatePatch(incidentId: string): Promise<Incident> {
    const inc = await this.getIncident(incidentId);
    if (!inc) throw new Error('Incident not found');

    const valService = getValidationService();
    const result = await valService.runAll(inc.id);
    inc.status = 'validating';
    inc.validationResult = result;
    return inc;
  }

  // DELEGATES security review to SecurityService (Rule #4)
  async runSecurityReview(incidentId: string): Promise<Incident> {
    const inc = await this.getIncident(incidentId);
    if (!inc) throw new Error('Incident not found');

    const secService = getSecurityService();
    const findings = (await secService.listFindings()).data;
    inc.status = 'security_review';
    inc.securityFindings = findings;
    return inc;
  }

  // REGRESSION VERIFICATION INVARIANT (Rule #6)
  async verifyRegression(incidentId: string): Promise<{ incident: Incident; outcome: 'resolved' | 'still_reproduces' }> {
    const inc = await this.getIncident(incidentId);
    if (!inc) throw new Error('Incident not found');

    const validationPassed = inc.validationResult ? inc.validationResult.status === 'passed' : true;
    const securityPassed = (inc.securityFindings || []).every(f => f.severity !== 'critical' && f.severity !== 'high');

    const outcome: 'resolved' | 'still_reproduces' = validationPassed && securityPassed ? 'resolved' : 'still_reproduces';

    if (outcome === 'resolved') {
      inc.status = 'needs_review';
      inc.regressionCheck = {
        status: 'resolved',
        message: 'Simulated regression test verified HTTP 403 Forbidden no longer reproduces.',
        verifiedAt: new Date().toISOString(),
      };
      inc.timeline.unshift({
        id: `tl_${Date.now()}`,
        timestamp: new Date().toISOString(),
        stage: 'regression_verification',
        title: 'Regression Verification Passed',
        description: 'Simulated test confirmed bug no longer reproduces.',
        actor: 'ANSTAT Regression Engine',
      });
    } else {
      inc.regressionCheck = {
        status: 'still_reproduces',
        message: 'Regression test failed. Issue still reproduces or security gate blocked.',
        verifiedAt: new Date().toISOString(),
      };
    }

    return { incident: inc, outcome };
  }

  // DELEGATES PR creation to CodeService / GitHubService (Rule #5 & #7)
  async createPullRequest(incidentId: string): Promise<Incident> {
    const inc = await this.getIncident(incidentId);
    if (!inc) throw new Error('Incident not found');

    const ghService = getGitHubService();
    await ghService.listPullRequests({ repositoryId: inc.repositoryId });

    inc.status = 'resolved';
    inc.pullRequestNumber = 104;
    inc.pullRequestUrl = 'https://github.com/northstar-studio/northstar-web-platform/pull/104';
    inc.timeline.unshift({
      id: `tl_${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'pull_request',
      title: 'Pull Request #104 Handoff Authorized',
      description: 'Feature branch anstat/fix-inc-104 proposed to GitHub repository main branch.',
      actor: 'Shishir Kumar',
    });
    return inc;
  }

  async reopenIncident(incidentId: string): Promise<Incident> {
    const inc = await this.getIncident(incidentId);
    if (!inc) throw new Error('Incident not found');

    inc.status = 'reopened';
    inc.attempts += 1;
    inc.timeline.unshift({
      id: `tl_${Date.now()}`,
      timestamp: new Date().toISOString(),
      stage: 'reopened',
      title: 'Incident Reopened',
      description: 'Reopened for investigation attempt ' + inc.attempts,
      actor: 'Shishir Kumar',
    });
    return inc;
  }

  async cancelInvestigation(incidentId: string): Promise<Incident> {
    const inc = await this.getIncident(incidentId);
    if (!inc) throw new Error('Incident not found');

    inc.status = 'closed';
    return inc;
  }

  async retryInvestigation(incidentId: string): Promise<Incident> {
    const inc = await this.getIncident(incidentId);
    if (!inc) throw new Error('Incident not found');

    inc.attempts += 1;
    inc.status = 'investigating';
    return inc;
  }
}
