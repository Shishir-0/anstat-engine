import { DebuggingService } from '../interfaces/debugging.service';
import { DebugSessionInput, DebugAnalysisResult } from '../../types/debug';
import { Job } from '../../types/job';
import { PaginatedResult, PaginationParams } from '../../types/common';

export class MockDebuggingService implements DebuggingService {
  private sessions: DebugAnalysisResult[] = [
    {
      id: 'dbg_session_01',
      organizationId: 'org_anstat_01',
      jobId: 'job_dbg_01',
      problemSummary: 'Unhandled NullPointer exception in checkout middleware session validation',
      rootCause: 'Target property `session.user.id` dereferenced before confirming `session.user` object is initialized.',
      evidence: [
        'Stack trace L42 in `app/api/checkout/route.ts`',
        'Null check omitted on guest checkout request payload.',
      ],
      potentialCauses: [
        'Guest user checkout path passes null session object',
        'Session cookie expiration race condition',
      ],
      recommendedFix: 'Add optional chaining `session?.user?.id` and guard clause returning 401 for non-guest protected actions.',
      proposedPatch: `@@ -40,3 +40,5 @@\n- const userId = session.user.id;\n+ if (!session?.user?.id && !isGuestCheckout(req)) {\n+   return new Response('Unauthorized', { status: 401 });\n+ }\n+ const userId = session?.user?.id;`,
      testingSteps: [
        'Trigger POST request to /api/checkout without session cookie',
        'Verify HTTP response status is 401 instead of 500 internal server error',
      ],
      confidenceLevel: 'high',
      isSimulated: true,
      createdAt: '2026-02-09T16:00:00Z',
      updatedAt: '2026-02-09T16:00:00Z',
    },
  ];

  async listSessions(params?: PaginationParams): Promise<PaginatedResult<DebugAnalysisResult>> {
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;

    return {
      data: this.sessions.slice(start, start + limit),
      total: this.sessions.length,
      page,
      limit,
      totalPages: Math.ceil(this.sessions.length / limit) || 1,
    };
  }

  async getSessionById(id: string): Promise<DebugAnalysisResult | null> {
    return this.sessions.find(s => s.id === id) || null;
  }

  async analyzeError(input: DebugSessionInput): Promise<{ session: DebugAnalysisResult; job: Job }> {
    const session: DebugAnalysisResult = {
      id: `dbg_${Date.now()}`,
      organizationId: 'org_anstat_01',
      jobId: `job_dbg_${Date.now()}`,
      problemSummary: input.errorMessage || 'Unknown stack trace exception',
      rootCause: 'Identified unhandled promise rejection and missing boundary check.',
      evidence: ['Analyzed stack trace and repository context.'],
      potentialCauses: ['Unsanitized input parameter', 'Async race condition'],
      recommendedFix: 'Wrap target operation in try-catch and validate payload structure.',
      proposedPatch: `+ // Guard check added by ANSTAT Debug Engine\n+ if (!input) return null;`,
      testingSteps: ['Re-run failing test suite', 'Verify exception is caught cleanly'],
      confidenceLevel: 'high',
      isSimulated: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.sessions.unshift(session);

    const job: Job = {
      id: session.jobId,
      organizationId: 'org_anstat_01',
      type: 'debugging',
      title: `Debug Error: ${input.errorMessage.slice(0, 40)}`,
      status: 'completed',
      progress: 100,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 8000,
      createdByUserId: 'user_shishir_01',
      createdByName: 'Shishir Kumar',
      steps: [
        { id: '1', name: 'Stack trace & error payload analysis', status: 'completed' },
        { id: '2', name: 'AST Code mapping', status: 'completed' },
        { id: '3', name: 'Root cause synthesis', status: 'completed' },
      ],
      events: [
        { id: 'e1', timestamp: new Date().toISOString(), level: 'info', message: 'Error log parsed.' },
        { id: 'e2', timestamp: new Date().toISOString(), level: 'success', message: 'Root cause identified.' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { session, job };
  }

  async applyPatch(sessionId: string): Promise<{ job: Job; prNumber?: number }> {
    const job: Job = {
      id: `job_patch_${Date.now()}`,
      organizationId: 'org_anstat_01',
      type: 'autofix',
      title: `Apply Patch for Debug Session #${sessionId}`,
      status: 'completed',
      progress: 100,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 11000,
      createdByUserId: 'user_shishir_01',
      createdByName: 'Shishir Kumar',
      steps: [
        { id: '1', name: 'Branch creation', status: 'completed' },
        { id: '2', name: 'Opening Pull Request', status: 'completed' },
      ],
      events: [
        { id: 'e1', timestamp: new Date().toISOString(), level: 'success', message: 'Opened PR #106.' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { job, prNumber: 106 };
  }
}
