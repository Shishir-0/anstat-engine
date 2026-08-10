import * as React from 'react';
import { getGitHubService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { GitPullRequest } from 'lucide-react';

export default async function GitHubPullRequestsPage() {
  const githubService = getGitHubService();
  const prs = await githubService.listPullRequests();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">GitHub Pull Requests</h1>
        <p className="text-xs text-slate-500">AI-generated and manual Pull Requests</p>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle>Pull Requests ({prs.total})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {prs.data.map((pr) => (
            <div key={pr.id} className="p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">{pr.title}</span>
                <Badge variant="info">PR #{pr.number}</Badge>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">+{pr.additions} / -{pr.deletions} • {pr.headBranch}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
