'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Incident } from '@/lib/types/debugging';
import { Repository } from '@/lib/types/github';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Bug, Plus, Search, ArrowUpRight, AlertTriangle, CheckCircle2, History, Clock } from 'lucide-react';

interface DebuggingCenterClientProps {
  initialIncidents: Incident[];
  repositories: Repository[];
}

export function DebuggingCenterClient({ initialIncidents, repositories }: DebuggingCenterClientProps) {
  const router = useRouter();
  const [incidents, setIncidents] = React.useState<Incident[]>(initialIncidents);
  const [search, setSearch] = React.useState('');
  const [severityFilter, setSeverityFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const filteredIncidents = incidents.filter(i => {
    const matchesSearch = i.title.toLowerCase().includes(search.toLowerCase()) || i.errorType.toLowerCase().includes(search.toLowerCase()) || i.repositoryName.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || i.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const highCriticalIncidents = incidents.filter(i => (i.severity === 'critical' || i.severity === 'high') && i.status !== 'resolved');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Debugging Hub</h1>
            <Badge variant="muted">Simulated Telemetry</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Investigate incidents, identify root causes, and ship verified remediations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/debugging/new">
            <Button variant="primary" size="sm">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> New Investigation
            </Button>
          </Link>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-rose-500 bg-rose-50/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-900 uppercase">Open Incidents</p>
              <h3 className="text-2xl font-bold text-slate-900 font-mono mt-1">{incidents.filter(i => i.status !== 'resolved').length}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Active Signals</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Investigating</p>
              <h3 className="text-2xl font-bold text-sky-600 font-mono mt-1">{incidents.filter(i => i.status === 'investigating' || i.status === 'open').length}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">AI Analysis Stage</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Bug className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Resolved Incidents</p>
              <h3 className="text-2xl font-bold text-emerald-600 font-mono mt-1">{incidents.filter(i => i.status === 'resolved').length}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">PR Handoff Verified</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Simulated MTTR</p>
              <h3 className="text-2xl font-bold text-slate-700 font-mono mt-1">24m</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Mean Time to Resolution</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PRIORITY INCIDENTS SECTION */}
      {highCriticalIncidents.length > 0 && (
        <Card className="border-l-4 border-l-rose-500">
          <CardHeader className="py-3 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <CardTitle className="text-sm">Priority Incidents ({highCriticalIncidents.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {highCriticalIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => router.push(`/debugging/${inc.id}`)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">{inc.title}</span>
                    <Badge variant="danger">{inc.severity.toUpperCase()}</Badge>
                    <Badge variant="muted">{inc.environment}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Repo: {inc.repositoryName} • Error: {inc.errorType} • Occurrences: {inc.occurrenceCount}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs border-rose-200 text-rose-800 hover:bg-rose-100">
                  Investigate <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* INCIDENT DATA TABLE */}
      <Card>
        <CardHeader className="py-4 border-b border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base">All Incidents ({filteredIncidents.length})</CardTitle>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search title, repo, or error..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="fix_proposed">Fix Proposed</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredIncidents.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">No active incidents matching criteria.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Incident Title</th>
                    <th className="py-3 px-4">Repository & Env</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIncidents.map((inc) => (
                    <tr
                      key={inc.id}
                      onClick={() => router.push(`/debugging/${inc.id}`)}
                      className="hover:bg-emerald-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-semibold text-slate-900 group-hover:text-emerald-700">
                        {inc.title}
                        <p className="text-[11px] text-slate-400 font-normal font-mono">{inc.errorType} • {inc.source}</p>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-mono text-[11px]">
                        {inc.repositoryName}
                        <p className="text-[10px] text-slate-400">{inc.environment}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={inc.severity === 'critical' || inc.severity === 'high' ? 'danger' : 'warning'}>
                          {inc.severity.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={inc.status === 'resolved' ? 'success' : 'info'}>
                          {inc.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-600">
                          Console <ArrowUpRight className="ml-1 h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
