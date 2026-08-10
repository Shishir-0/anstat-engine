import * as React from 'react';
import { getGitHubService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { GitBranch, GitPullRequest } from 'lucide-react';

export default async function GitHubPage() {
  const githubService = getGitHubService();
  const repos = await githubService.listRepositories();
  const prs = await githubService.listPullRequests();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">GitHub Center</h1>
          <p className="text-xs text-slate-500 mt-1">Connected repositories, branch sync status, and automated PR delivery.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="py-4">
            <CardTitle>Connected Repositories ({repos.total})</CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {repos.data.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">{r.fullName}</h4>
                  <p className="text-[11px] text-slate-500">{r.description}</p>
                </div>
                <Badge variant="success">Connected</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

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
    </div>
  );
}
