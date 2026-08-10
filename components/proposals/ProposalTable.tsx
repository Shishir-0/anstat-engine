'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ProposalDocument, ProposalStatus } from '@/lib/types/proposal';
import { Client } from '@/lib/types/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PROPOSAL_STATUS_META } from '@/lib/constants/status';
import { Search, Filter, ArrowUpDown, FileText, ChevronRight, MoreHorizontal, Copy, Trash2, Send } from 'lucide-react';
import { getProposalService } from '@/lib/services/registry';

interface ProposalTableProps {
  initialProposals: ProposalDocument[];
  totalCount: number;
  clients: Client[];
}

export function ProposalTable({ initialProposals, totalCount, clients }: ProposalTableProps) {
  const router = useRouter();
  const [proposals, setProposals] = React.useState<ProposalDocument[]>(initialProposals);
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [clientFilter, setClientFilter] = React.useState<string>('all');
  const [sortBy, setSortBy] = React.useState<string>('newest');

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesClient = clientFilter === 'all' || p.clientId === clientFilter;
    return matchesSearch && matchesStatus && matchesClient;
  }).sort((a, b) => {
    if (sortBy === 'highest_value') return b.totalValueUsd - a.totalValueUsd;
    if (sortBy === 'lowest_value') return a.totalValueUsd - b.totalValueUsd;
    if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const proposalService = getProposalService();
    const copy = await proposalService.duplicate(id);
    setProposals([copy, ...proposals]);
  };

  return (
    <Card>
      {/* Filter Bar */}
      <CardHeader className="py-4 border-b border-slate-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base">All Proposals ({filteredProposals.length})</CardTitle>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search proposal or client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="generated">AI Generated</option>
              <option value="review">In Review</option>
              <option value="sent">Sent</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>

            {/* Client Filter */}
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="h-8 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">All Clients</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-8 rounded-md border border-slate-300 bg-white px-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="newest">Sort: Recently Updated</option>
              <option value="highest_value">Sort: Highest Value</option>
              <option value="lowest_value">Sort: Lowest Value</option>
              <option value="oldest">Sort: Oldest</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {filteredProposals.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <FileText className="h-8 w-8 text-slate-400 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-900">No proposals found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No proposal matching your search criteria. Create your first rate-card backed SOW proposal.
            </p>
            <Link href="/proposals/new">
              <Button variant="primary" size="sm">Create Proposal</Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Proposal & Scope</th>
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Value (USD)</th>
                    <th className="py-3 px-4">Last Updated</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProposals.map((p) => {
                    const statusMeta = PROPOSAL_STATUS_META[p.status] || { label: p.status, variant: 'muted' as const };
                    return (
                      <tr
                        key={p.id}
                        onClick={() => router.push(`/proposals/${p.id}`)}
                        className="hover:bg-emerald-50/30 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-semibold text-slate-900 group-hover:text-emerald-700">
                          {p.title}
                          <p className="text-[11px] text-slate-400 font-normal truncate max-w-xs">{p.executiveSummary}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-medium">{p.clientName}</td>
                        <td className="py-3.5 px-4">
                          <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                          ${p.totalValueUsd.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono">
                          {new Date(p.updatedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDuplicate(e, p.id)}
                            title="Duplicate Proposal"
                            className="h-7 px-2 text-slate-500 hover:text-emerald-700"
                          >
                            <Copy className="h-3.5 w-3.5 mr-1" /> Duplicate
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards View */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredProposals.map((p) => (
                <Link
                  key={p.id}
                  href={`/proposals/${p.id}`}
                  className="block p-4 space-y-2 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-slate-900">{p.title}</span>
                    <Badge variant={PROPOSAL_STATUS_META[p.status]?.variant || 'muted'}>
                      {PROPOSAL_STATUS_META[p.status]?.label || p.status}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">Client: {p.clientName}</p>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="font-bold text-slate-900 font-mono">${p.totalValueUsd.toLocaleString()}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{new Date(p.updatedAt).toLocaleDateString()}</span>
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
