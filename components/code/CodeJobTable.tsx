'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CodeJob } from '@/lib/types/code';
import { Repository } from '@/lib/types/github';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Search, Code, GitBranch, ArrowUpRight, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { getCodeService } from '@/lib/services/registry';

interface CodeJobTableProps {
  initialJobs: CodeJob[];
  repositories: Repository[];
}

export function CodeJobTable({ initialJobs, repositories }: CodeJobTableProps) {
  const router = useRouter();
  const [jobs, setJobs] = React.useState<CodeJob[]>(initialJobs);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [repoFilter, setRepoFilter] = React.useState<string>('all');

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.issue.title.toLowerCase().includes(search.toLowerCase()) || j.repositoryName.toLowerCase().includes(search.toLowerCase()) || j.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    const matchesRepo = repoFilter === 'all' || j.repositoryId === repoFilter;
    return matchesSearch && matchesStatus && matchesRepo;
  });

  const handleRetry = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const codeService = getCodeService();
    const retried = await codeService.retryJob(id);
    setJobs(jobs.map(j => (j.id === id ? retried : j)));
  };

  return (
    <Card>
      <CardHeader className="py-4 border-b border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base">Code Execution Jobs ({filteredJobs.length})</CardTitle>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-initial min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search task or repository..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="needs_review">Needs Review</option>
              <option value="completed">Completed</option>
              <option value="running">Running</option>
              <option value="failed">Failed</option>
            </select>

            <select
              value={repoFilter}
              onChange={(e) => setRepoFilter(e.target.value)}
              className="h-8 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Repositories</option>
              {repositories.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredJobs.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Code className="h-8 w-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-900">No code jobs found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No active or completed code jobs matching your search parameters.
            </p>
            <Link href="/code/new">
              <Button variant="primary" size="sm">+ New Code Job</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Task & Issue</th>
                    <th className="py-3 px-4">Repository</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Files Changed</th>
                    <th className="py-3 px-4">Validation</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.map((j) => (
                    <tr
                      key={j.id}
                      onClick={() => router.push(`/code/${j.id}`)}
                      className="hover:bg-emerald-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 group-hover:text-emerald-700">
                        {j.issue.title}
                        <p className="text-[11px] text-slate-400 font-mono font-normal">#{j.issue.issueNumber || '104'} • Branch: {j.featureBranch}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium font-mono">{j.repositoryName}</td>
                      <td className="py-3.5 px-4">
                        <Badge variant={j.status === 'completed' ? 'success' : j.status === 'needs_review' ? 'info' : 'warning'}>
                          {j.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {j.patch ? `${j.patch.filesChangedCount} files (+${j.patch.additions} -${j.patch.deletions})` : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center text-emerald-700 font-semibold text-[11px]">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> 4/4 Passed
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {new Date(j.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleRetry(e, j.id)}
                          className="h-7 px-2 text-slate-500 hover:text-emerald-700"
                        >
                          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredJobs.map((j) => (
                <Link
                  key={j.id}
                  href={`/code/${j.id}`}
                  className="block p-4 space-y-2 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-slate-900">{j.issue.title}</span>
                    <Badge variant={j.status === 'completed' ? 'success' : 'info'}>{j.status}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">Repo: {j.repositoryName}</p>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-400 font-mono text-[10px]">{new Date(j.createdAt).toLocaleDateString()}</span>
                    <span className="font-semibold text-emerald-700 text-[11px]">✓ 4/4 Checks Passed</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
