import { AIService } from '../interfaces/ai.service';
import { CodePlan, CodePatch, CodeRepositoryContext, CodeIssueContext } from '../../types/code';

export class MockAIService implements AIService {
  async analyzeContext(repoId: string, issue: CodeIssueContext): Promise<CodeRepositoryContext> {
    return {
      repositoryId: repoId,
      repositoryName: 'northstar-web-platform',
      branch: 'main',
      selectedFiles: [
        'app/api/admin/users/route.ts',
        'lib/auth/rbac-guard.ts',
        'middleware.ts',
        'lib/types/permissions.ts',
      ],
      excludedFiles: ['node_modules/', '.next/', 'public/'],
      estimatedTokens: 42800,
      dependencies: ['next', 'lucide-react', 'zod'],
      symbols: ['checkPermission', 'RoleGuard', 'UserRole'],
    };
  }

  async generatePlan(issue: CodeIssueContext, context: CodeRepositoryContext, modelId: string): Promise<CodePlan> {
    return {
      id: `plan_${Date.now()}`,
      summary: `Implementation plan for: ${issue.title}`,
      steps: [
        {
          id: 'step_1',
          title: 'Add Role & Permission Type Definitions',
          description: 'Define UserRole enum and PermissionMatrix interface in lib/types/permissions.ts.',
          affectedFiles: ['lib/types/permissions.ts'],
          status: 'completed',
          order: 1,
        },
        {
          id: 'step_2',
          title: 'Implement RBAC Helper Middleware',
          description: 'Create checkPermission(user, requiredRole) helper function in lib/auth/rbac-guard.ts.',
          affectedFiles: ['lib/auth/rbac-guard.ts'],
          status: 'completed',
          order: 2,
        },
        {
          id: 'step_3',
          title: 'Protect Admin API Routes',
          description: 'Wrap /api/admin/* handlers with authorization check.',
          affectedFiles: ['app/api/admin/users/route.ts'],
          status: 'completed',
          order: 3,
        },
      ],
      isApproved: true,
      createdAt: new Date().toISOString(),
    };
  }

  async generatePatch(plan: CodePlan, context: CodeRepositoryContext, modelId: string): Promise<CodePatch> {
    return {
      id: `patch_${Date.now()}`,
      filesChangedCount: 3,
      additions: 142,
      deletions: 18,
      fileDiffs: [
        {
          id: 'fd_1',
          file: 'lib/auth/rbac-guard.ts',
          status: 'added',
          additions: 68,
          deletions: 0,
          aiExplanation: 'Adds permission guard helper validating JWT user claims against required route permissions.',
          riskLevel: 'low',
          confidenceScore: 98,
          chunks: [
            {
              oldStart: 0,
              oldLines: 0,
              newStart: 1,
              newLines: 8,
              lines: [
                '+ import { UserRole, Permission } from "@/lib/types/permissions";',
                '+ import { getAuthState } from "@/lib/services/registry";',
                '+ ',
                '+ export async function checkPermission(requiredRole: UserRole): Promise<boolean> {',
                '+   const auth = await getAuthState();',
                '+   if (!auth.isAuthenticated || !auth.user) return false;',
                '+   return auth.user.role === requiredRole || auth.user.role === "owner";',
                '+ }',
              ],
            },
          ],
        },
        {
          id: 'fd_2',
          file: 'app/api/admin/users/route.ts',
          status: 'modified',
          additions: 44,
          deletions: 12,
          aiExplanation: 'Wraps admin users mutation handler in checkPermission("admin") assertion block.',
          riskLevel: 'low',
          confidenceScore: 96,
          chunks: [
            {
              oldStart: 14,
              oldLines: 4,
              newStart: 14,
              newLines: 6,
              lines: [
                '  export async function POST(req: Request) {',
                '-   const body = await req.json();',
                '+   const hasPerm = await checkPermission("owner");',
                '+   if (!hasPerm) return new Response("Unauthorized", { status: 403 });',
                '+   const body = await req.json();',
              ],
            },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
    };
  }

  async explainChange(filePath: string, diffText: string): Promise<string> {
    return `Modification in ${filePath} establishes explicit authorization boundaries to prevent unauthorized role escalation.`;
  }

  async summarizePullRequest(patch: CodePatch, issue: CodeIssueContext): Promise<{ title: string; body: string }> {
    return {
      title: `feat(auth): ${issue.title}`,
      body: `## ANSTAT AI Patch Summary\n\n### Task:\n${issue.description}\n\n### Changed Files (${patch.filesChangedCount}):\n- ${patch.fileDiffs.map(f => f.file).join('\n- ')}\n\n### Validation:\n- TypeScript Compiler (tsc)\n- ESLint Rules\n- Jest Unit Tests\n- Security SAST Scan Passed`,
    };
  }
}
