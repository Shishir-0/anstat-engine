'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SecurityFinding, SecurityScan } from '@/lib/types/security';
import { Repository } from '@/lib/types/github';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Search, Shield, ArrowUpRight, CheckCircle2, AlertTriangle, Filter } from 'lucide-react';

interface SecurityFindingsTableProps {
  initialFindings: SecurityFinding[];
  initialScans: SecurityScan[];
  repositories: Repository[];
}

export function SecurityFindingsTable({ initialFindings, initialScans, repositories }: SecurityFindingsTableProps) {
  const router = useRouter();
  const [findings, setFindings] = React.useState<SecurityFinding[]>(initialFindings);
  const [search, setSearch] = React.useState('');
  const [severityFilter, setSeverityFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');

  const filteredFindings = findings.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(search.toLowerCase()) || f.file.toLowerCase().includes(search.toLowerCase()) || (f.cwe && f.cwe.toLowerCase().includes(search.toLowerCase()));
    const matchesSeverity = severityFilter === 'all' || f.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || f.category === categoryFilter;
    return matchesSearch && matchesSeverity && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Security Scans & Findings</h1>
          <p className="text-xs text-slate-500 mt-1">Manage vulnerability findings and audit histories.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4 border-b border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base">Vulnerability Findings ({filteredFindings.length})</CardTitle>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 sm:flex-initial min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search finding, file, or CWE..."
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
                <option value="resolved">Resolved</option>
                <option value="accepted_risk">Accepted Risk</option>
                <option value="false_positive">False Positive</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredFindings.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">No security findings matching criteria.</div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Finding & Standards</th>
                      <th className="py-3 px-4">Repository & File</th>
                      <th className="py-3 px-4">Severity</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFindings.map((f) => (
                      <tr
                        key={f.id}
                        onClick={() => router.push(`/security/scans/${f.id}`)}
                        className="hover:bg-emerald-50/30 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-900 group-hover:text-emerald-700">
                          {f.title}
                          <p className="text-[11px] text-slate-400 font-normal font-mono">{f.cwe} • {f.owasp}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-mono text-[11px]">
                          {f.repositoryName}
                          <p className="text-[10px] text-slate-400">{f.file}:{f.line}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={f.severity === 'critical' || f.severity === 'high' ? 'danger' : 'warning'}>
                            {f.severity.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={f.status === 'resolved' ? 'success' : f.status === 'accepted_risk' ? 'muted' : 'info'}>
                            {f.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-600">
                            Details <ArrowUpRight className="ml-1 h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="block md:hidden divide-y divide-slate-100">
                {filteredFindings.map((f) => (
                  <Link key={f.id} href={`/security/scans/${f.id}`} className="block p-4 space-y-2 hover:bg-slate-50">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-slate-900">{f.title}</span>
                      <Badge variant={f.severity === 'high' ? 'danger' : 'warning'}>{f.severity.toUpperCase()}</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono">{f.file}:{f.line}</p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
