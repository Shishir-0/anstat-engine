import * as React from 'react';
import { getProposalService, getClientService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ProposalTable } from '@/components/proposals/ProposalTable';
import { Sparkles, FileText, Plus, Search, DollarSign, CheckCircle2, Send, FileEdit } from 'lucide-react';
import Link from 'next/link';

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string; status?: string; clientId?: string; sortBy?: string }>;
}) {
  const params = await searchParams;
  const proposalService = getProposalService();
  const clientService = getClientService();

  const proposalsResult = await proposalService.list({
    query: params?.query,
    status: params?.status as any,
    clientId: params?.clientId,
    sortBy: params?.sortBy,
  });

  const allProposals = (await proposalService.list({ limit: 100 })).data;
  const clients = (await clientService.list({ limit: 50 })).data;

  // Pipeline calculations
  const totalProposals = allProposals.length;
  const draftsCount = allProposals.filter(p => p.status === 'draft' || p.status === 'generated' || p.status === 'review').length;
  const sentCount = allProposals.filter(p => p.status === 'sent').length;
  const wonCount = allProposals.filter(p => p.status === 'won').length;
  const pipelineValue = allProposals.reduce((acc, p) => acc + p.totalValueUsd, 0);
  const wonValue = allProposals.filter(p => p.status === 'won').reduce((acc, p) => acc + p.totalValueUsd, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Proposals & SOW Engine</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, manage, and deliver rate-card backed SOW client proposals.
          </p>
        </div>
        <Link href="/proposals/new">
          <Button variant="primary" size="sm">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" /> + New Proposal
          </Button>
        </Link>
      </div>

      {/* Top-Level Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3">
          <p className="text-[11px] font-medium text-slate-500">Total Proposals</p>
          <h4 className="text-lg font-bold text-slate-900 mt-0.5">{totalProposals}</h4>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-medium text-slate-500">In Review / Draft</p>
          <h4 className="text-lg font-bold text-amber-600 mt-0.5">{draftsCount}</h4>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-medium text-slate-500">Sent to Client</p>
          <h4 className="text-lg font-bold text-sky-600 mt-0.5">{sentCount}</h4>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-medium text-slate-500">Won Proposals</p>
          <h4 className="text-lg font-bold text-emerald-600 mt-0.5">{wonCount}</h4>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-medium text-slate-500">Pipeline Value</p>
          <h4 className="text-lg font-bold text-slate-900 mt-0.5">${(pipelineValue / 1000).toFixed(0)}k</h4>
        </Card>
        <Card className="p-3">
          <p className="text-[11px] font-medium text-slate-500">Won Revenue</p>
          <h4 className="text-lg font-bold text-emerald-700 mt-0.5">${(wonValue / 1000).toFixed(0)}k</h4>
        </Card>
      </div>

      {/* Interactive Proposals Table & Filters */}
      <ProposalTable
        initialProposals={proposalsResult.data}
        totalCount={proposalsResult.total}
        clients={clients}
      />
    </div>
  );
}
