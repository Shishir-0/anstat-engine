import * as React from 'react';
import { getGitHubService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { GitBranch } from 'lucide-react';

export default async function GitHubReposPage() {
  const githubService = getGitHubService();
  const repos = await githubService.listRepositories();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">GitHub Repositories</h1>
        <p className="text-xs text-slate-500">Connected repositories & branch sync status</p>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle>Repositories ({repos.total})</CardTitle>
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
    </div>
  );
}
