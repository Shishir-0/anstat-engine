import * as React from 'react';
import Link from 'next/link';
import {
  getAuthService,
  getProposalService,
  getJobsService,
  getSecurityService,
  getGitHubService,
  getUsageService,
  getAuditService,
} from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Sparkles,
  FileText,
  Shield,
  Code,
  Rocket,
  ArrowUpRight,
  Activity,
  AlertTriangle,
  GitPullRequest,
  CheckCircle2,
  TrendingUp,
  Bug,
} from 'lucide-react';

export default async function DashboardPage() {
  const authService = getAuthService();
  const proposalService = getProposalService();
  const jobsService = getJobsService();
  const securityService = getSecurityService();
  const githubService = getGitHubService();
  const usageService = getUsageService();
  const auditService = getAuditService();

  const user = await authService.getCurrentUser();
  const org = await authService.getCurrentOrganization();
  const proposals = await proposalService.list();
  const jobs = await jobsService.listJobs();
  const scans = await securityService.listScans();
  const prs = await githubService.listPullRequests();
  const budget = await usageService.getBudgetStatus();
  const auditEvents = await auditService.listEvents();

  // Attention Items
  const attentionItems = [
    {
      id: 'att_01',
      title: 'High Severity CSRF Finding Detected',
      description: 'Missing CSRF Guard on `app/api/workspace/update/route.ts` requires review.',
      severity: 'high' as const,
      href: '/security',
      actionText: 'Review Finding',
    },
    {
      id: 'att_02',
      title: 'Code Generation PR #104 Open',
      description: 'RBAC guard patch branch ready for merge into main.',
      severity: 'medium' as const,
      href: '/github/pull-requests',
      actionText: 'View PR #104',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. DASHBOARD HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Good morning, {user?.name || 'Engineer'}
            </h1>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              {org?.name || 'Northstar Studio'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Here&apos;s what&apos;s happening across your AI-assisted software delivery workspace.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/proposals/new">
            <Button variant="primary" size="sm">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> + New Proposal
            </Button>
          </Link>
          <Link href="/code/new">
            <Button variant="outline" size="sm">
              <Code className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Generate Code
            </Button>
          </Link>
          <Link href="/security">
            <Button variant="outline" size="sm">
              <Shield className="mr-1.5 h-3.5 w-3.5 text-emerald-600" /> Run Security Scan
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. ATTENTION REQUIRED SECTION */}
      {attentionItems.length > 0 && (
        <Card className="border-l-4 border-l-rose-500 bg-rose-50/20">
          <CardHeader className="py-3 flex flex-row items-center justify-between border-b-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <CardTitle className="text-sm font-bold text-rose-900">Attention Required ({attentionItems.length})</CardTitle>
            </div>
            <span className="text-[11px] font-semibold text-rose-700">Action items needing engineer sign-off</span>
          </CardHeader>
          <CardContent className="py-2 divide-y divide-rose-100">
            {attentionItems.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-slate-900">{item.title}</h4>
                  <p className="text-[11px] text-slate-600">{item.description}</p>
                </div>
                <Link href={item.href}>
                  <Button variant="outline" size="sm" className="h-7 text-xs border-rose-200 text-rose-800 hover:bg-rose-100">
                    {item.actionText} <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 3. EXECUTIVE METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Proposals Generated</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-900">{proposals.total}</h3>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-0.5" /> +18%
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">$243,000 Won Value</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Active AI Jobs</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-900">{jobs.total}</h3>
                <span className="text-[10px] font-semibold text-sky-600 font-mono">1 Running</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Code & Security Workers</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Open PRs</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-900">{prs.total}</h3>
                <span className="text-[10px] font-semibold text-emerald-600">All Passed</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Automated Patch Delivery</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <GitPullRequest className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Monthly AI Spend</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-900">${budget.usedUsd.toFixed(2)}</h3>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {budget.percentUsed}% of ${budget.monthlyBudgetUsd} limit
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Rocket className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. ACTIVE AI JOBS & DELIVERY OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active AI Jobs Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div>
              <CardTitle>Active AI Delivery Jobs</CardTitle>
              <CardDescription>Real-time background worker status & execution steps</CardDescription>
            </div>
            <Link href="/jobs" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Control Room <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 p-0">
            {jobs.data.map((job) => (
              <div key={job.id} className="p-4 space-y-2 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">{job.title}</span>
                    <Badge variant={job.status === 'completed' ? 'success' : 'info'}>{job.status}</Badge>
                  </div>
                  <span className="text-xs font-mono text-slate-500">{job.progress}%</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={job.status === 'completed' ? 'bg-emerald-600 h-full' : 'bg-sky-500 h-full animate-pulse'}
                    style={{ width: `${job.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Repo: {job.repositoryName || 'N/A'}</span>
                  <span>Model: {job.modelId || 'claude-3-5-sonnet'}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security & AI Usage Summaries */}
        <div className="space-y-6">
          {/* Security Posture Summary Widget */}
          <Card>
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <CardTitle>Security Posture</CardTitle>
                <Badge variant="info">Demo Scan</Badge>
              </div>
              <CardDescription>Static analysis & vulnerability score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <div>
                  <span className="text-2xl font-bold text-emerald-900">24</span>
                  <span className="text-xs text-emerald-700 ml-1">/ 100 Risk Score</span>
                </div>
                <Badge variant="success">Low Risk</Badge>
              </div>
              <p className="text-xs text-slate-600">3 total findings require review (1 High, 2 Medium).</p>
              <Link href="/security" className="block pt-1">
                <Button variant="outline" size="sm" className="w-full">
                  Open Security Center <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Usage Budget Gauge */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle>AI Cost Quota</CardTitle>
              <CardDescription>Monthly workspace token allocation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">Used Budget</span>
                  <span className="text-slate-900 font-bold font-mono">${budget.usedUsd.toFixed(2)} / ${budget.monthlyBudgetUsd}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full" style={{ width: `${budget.percentUsed}%` }} />
                </div>
              </div>
              <p className="text-[11px] text-slate-500">Remaining quota: ${budget.remainingUsd.toFixed(2)} USD.</p>
              <Link href="/usage" className="block">
                <Button variant="ghost" size="sm" className="w-full text-xs text-emerald-600 hover:text-emerald-700">
                  View Cost Ledger
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 5. QUICK ACTIONS & RECENT ACTIVITY FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Quick Actions */}
        <Card>
          <CardHeader className="py-4">
            <CardTitle>Delivery Quick Actions</CardTitle>
            <CardDescription>Launch AI operational workflows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/proposals/new" className="block">
              <div className="p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-emerald-900">New Proposal & SOW</h4>
                    <p className="text-[11px] text-slate-500">Rate-card backed SOW generator</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
              </div>
            </Link>

            <Link href="/code/new" className="block">
              <div className="p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <Code className="h-4 w-4 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-emerald-900">Generate Patch & PR</h4>
                    <p className="text-[11px] text-slate-500">Diff-first code generation engine</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
              </div>
            </Link>

            <Link href="/security" className="block">
              <div className="p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-emerald-900">Run Security Scan</h4>
                    <p className="text-[11px] text-slate-500">SAST & dependency risk check</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
              </div>
            </Link>

            <Link href="/debugging" className="block">
              <div className="p-3 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <Bug className="h-4 w-4 text-emerald-600" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 group-hover:text-emerald-900">Debug Error Trace</h4>
                    <p className="text-[11px] text-slate-500">AI stack trace analyzer</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity Stream */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <div>
              <CardTitle>Recent Delivery Stream</CardTitle>
              <CardDescription>Immutable operational audit events</CardDescription>
            </div>
            <Link href="/activity" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              Full Audit Stream <ArrowUpRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-slate-100">
            {auditEvents.data.slice(0, 5).map((evt) => (
              <div key={evt.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-slate-900">{evt.resourceName}</span>
                    <Badge variant="muted">{evt.action}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">Actor: {evt.actor.userName}</p>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
