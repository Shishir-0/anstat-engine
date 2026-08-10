import * as React from 'react';
import Link from 'next/link';
import { getCodeService, getGitHubService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CodeJobTable } from '@/components/code/CodeJobTable';
import { Code, Sparkles, Activity, CheckCircle2, GitPullRequest, Shield, FileCode2 } from 'lucide-react';

export default async function CodeEnginePage() {
  const codeService = getCodeService();
  const githubService = getGitHubService();

  const jobsResult = await codeService.listJobs({ limit: 50 });
  const repos = (await githubService.listRepositories()).data;
  const prs = (await githubService.listPullRequests()).data;

  const jobs = jobsResult.data;
  const activeJobsCount = jobs.filter(j => j.status === 'running' || j.status === 'analyzing' || j.status === 'planning' || j.status === 'generating' || j.status === 'validating').length;
  const completedJobsCount = jobs.filter(j => j.status === 'completed' || j.status === 'needs_review').length;
  const totalFilesChanged = jobs.reduce((acc, j) => acc + (j.patch?.filesChangedCount || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Code Engine</h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate, validate, and review automated code patches across your repositories.
          </p>
        </div>
        <Link href="/code/new">
          <Button variant="primary" size="sm">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> + New Code Job
          </Button>
        </Link>
      </div>

      {/* Code Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3">
          <p className="text-[11px] font-medium text-slate-500">Active Jobs</p>
          <h4 className="text-lg font-bold text-sky-600 font-mono mt-0.5">{activeJobsCount}</h4>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-medium text-slate-500">Completed Jobs</p>
          <h4 className="text-lg font-bold text-emerald-600 font-mono mt-0.5">{completedJobsCount}</h4>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-medium text-slate-500">Open Pull Requests</p>
          <h4 className="text-lg font-bold text-slate-900 font-mono mt-0.5">{prs.length}</h4>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-medium text-slate-500">Files Changed</p>
          <h4 className="text-lg font-bold text-slate-900 font-mono mt-0.5">{totalFilesChanged}</h4>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-medium text-slate-500">Validation Pass Rate</p>
          <h4 className="text-lg font-bold text-emerald-700 font-mono mt-0.5">100%</h4>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-medium text-slate-500">Security Findings</p>
          <h4 className="text-lg font-bold text-amber-600 font-mono mt-0.5">0 Blockers</h4>
        </Card>
      </div>

      {/* Code Jobs Data Table */}
      <CodeJobTable initialJobs={jobs} repositories={repos} />
    </div>
  );
}
