import { CodePlan, CodePatch, CodeRepositoryContext, CodeIssueContext } from '../../types/code';

export interface AIService {
  analyzeContext(repoId: string, issue: CodeIssueContext): Promise<CodeRepositoryContext>;
  generatePlan(issue: CodeIssueContext, context: CodeRepositoryContext, modelId: string): Promise<CodePlan>;
  generatePatch(plan: CodePlan, context: CodeRepositoryContext, modelId: string): Promise<CodePatch>;
  explainChange(filePath: string, diffText: string): Promise<string>;
  summarizePullRequest(patch: CodePatch, issue: CodeIssueContext): Promise<{ title: string; body: string }>;
}
