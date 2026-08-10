'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CodeJob, FileDiff } from '@/lib/types/code';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  Code,
  GitBranch,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  XCircle,
  FileCode,
  ShieldCheck,
  Terminal,
  Layers,
  Sparkles,
  ArrowLeft,
  Bot,
  Copy,
  Check,
} from 'lucide-react';
import { getCodeService } from '@/lib/services/registry';

interface CodeConsoleClientProps {
  initialJob: CodeJob;
}

export function CodeConsoleClient({ initialJob }: CodeConsoleClientProps) {
  const router = useRouter();
  const [job, setJob] = React.useState<CodeJob>(initialJob);
  const [selectedFileIndex, setSelectedFileIndex] = React.useState(0);
  const [diffMode, setDiffMode] = React.useState<'unified' | 'split'>('unified');

  // Modals
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);
  const [isPlanFeedbackOpen, setIsPlanFeedbackOpen] = React.useState(false);
  const [planFeedback, setPlanFeedback] = React.useState('');
  const [isPrOpen, setIsPrOpen] = React.useState(false);

  // States
  const [isActionLoading, setIsActionLoading] = React.useState(false);

  const fileDiffs = job.patch?.fileDiffs || [];
  const activeDiff = fileDiffs[selectedFileIndex] || fileDiffs[0];

  const handleApprovePlan = async () => {
    setIsActionLoading(true);
    const codeService = getCodeService();
    const updated = await codeService.approvePlan(job.id);
    setJob(updated);
    setIsActionLoading(false);
  };

  const handleRequestPlanChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsActionLoading(true);
    const codeService = getCodeService();
    const updated = await codeService.requestPlanChanges(job.id, planFeedback);
    setJob(updated);
    setIsPlanFeedbackOpen(false);
    setIsActionLoading(false);
  };

  const handleCreatePr = async () => {
    setIsActionLoading(true);
    const codeService = getCodeService();
    const updated = await codeService.createPullRequest(job.id);
    setJob(updated);
    setIsActionLoading(false);
    setIsPrOpen(false);
  };

  const handleCancel = async () => {
    const codeService = getCodeService();
    const updated = await codeService.cancelJob(job.id);
    setJob(updated);
    setIsCancelOpen(false);
  };

  const handleRetry = async () => {
    const codeService = getCodeService();
    const updated = await codeService.retryJob(job.id);
    setJob(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* JOB HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/code')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{job.issue.title}</h1>
              <Badge variant={job.status === 'completed' ? 'success' : job.status === 'needs_review' ? 'info' : 'warning'}>
                {job.status}
              </Badge>
              <Badge variant="muted">Simulated Execution</Badge>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Repo: <strong className="text-slate-800">{job.repositoryName}</strong> • Branch: <strong className="text-slate-800">{job.featureBranch}</strong> • Est. Cost: ${job.estimatedCostUsd}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRetry} title="Retry Job">
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry
          </Button>
          <Button variant="outline" size="sm" className="text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => setIsCancelOpen(true)}>
            <XCircle className="h-3.5 w-3.5 mr-1" /> Cancel Job
          </Button>
        </div>
      </div>

      {/* 1. AI IMPLEMENTATION PLAN PANEL */}
      {job.plan && (
        <Card className="border-sky-200 bg-sky-50/20">
          <CardHeader className="py-3 flex flex-row items-center justify-between border-b border-sky-100">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-600" />
              <CardTitle className="text-xs">AI Implementation Plan</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {!job.plan.isApproved ? (
                <>
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsPlanFeedbackOpen(true)}>
                    Request Changes
                  </Button>
                  <Button variant="primary" size="sm" className="h-7 text-xs" onClick={handleApprovePlan} isLoading={isActionLoading}>
                    Approve Plan
                  </Button>
                </>
              ) : (
                <Badge variant="success">Plan Approved</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-3 space-y-2 text-xs">
            <p className="font-semibold text-slate-900">{job.plan.summary}</p>
            <div className="space-y-1.5">
              {job.plan.steps.map((step) => (
                <div key={step.id} className="p-2 bg-white rounded border border-slate-200 flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{step.order}. {step.title}</span>
                    <p className="text-[11px] text-slate-600">{step.description}</p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Files: {step.affectedFiles.join(', ')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. ACCESSIBLE DIFF VIEWER WITH SEMANTIC LABELS */}
      {job.patch && (
        <Card className="overflow-hidden">
          <CardHeader className="py-3 border-b border-slate-200 flex flex-row items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-sm">Generated Patch Diff ({job.patch.filesChangedCount} Files, +{job.patch.additions} -{job.patch.deletions})</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDiffMode('unified')}
                className={`px-2 py-1 text-xs font-semibold rounded ${diffMode === 'unified' ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-700'}`}
              >
                Unified Diff
              </button>
              <button
                onClick={() => setDiffMode('split')}
                className={`px-2 py-1 text-xs font-semibold rounded ${diffMode === 'split' ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-700'}`}
              >
                Split View
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-0 grid grid-cols-1 lg:grid-cols-12 min-h-[400px]">
            {/* File List Tree (3 cols) */}
            <div className="lg:col-span-3 border-r border-slate-200 p-2 space-y-1 bg-slate-50/30 text-xs">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Changed Files</div>
              {fileDiffs.map((fd, idx) => (
                <button
                  key={fd.id}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full text-left p-2 rounded flex items-center justify-between transition-colors cursor-pointer ${
                    selectedFileIndex === idx ? 'bg-emerald-50 text-emerald-900 font-semibold border-l-2 border-emerald-600' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate font-mono text-[11px]">{fd.file}</span>
                  <span className="text-[10px] font-mono text-emerald-700 font-bold">+{fd.additions}</span>
                </button>
              ))}
            </div>

            {/* Accessible Code Diff Canvas (6 cols) */}
            <div className="lg:col-span-6 p-4 font-mono text-xs overflow-x-auto bg-slate-950 text-slate-100 space-y-1">
              <div className="text-[11px] text-slate-400 pb-2 border-b border-slate-800 flex justify-between">
                <span>File: {activeDiff?.file}</span>
                <span className="text-emerald-400 font-bold">Risk: {activeDiff?.riskLevel?.toUpperCase()}</span>
              </div>
              {activeDiff?.chunks.map((chunk, cIdx) => (
                <div key={cIdx} className="space-y-0.5 pt-1">
                  {chunk.lines.map((line, lIdx) => {
                    const isAdd = line.startsWith('+');
                    const isDel = line.startsWith('-');
                    return (
                      <div
                        key={lIdx}
                        className={`px-2 py-0.5 rounded whitespace-pre flex items-start gap-2 ${
                          isAdd ? 'bg-emerald-950/80 text-emerald-300' : isDel ? 'bg-rose-950/80 text-rose-300' : 'text-slate-400'
                        }`}
                      >
                        <span className="text-[9px] uppercase font-bold text-slate-500 shrink-0 w-8 select-none">
                          {isAdd ? '[ADD]' : isDel ? '[DEL]' : '     '}
                        </span>
                        <span className="flex-1">{line}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* AI Change Explanation (3 cols) */}
            <div className="lg:col-span-3 p-3 border-l border-slate-200 bg-white space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-1">AI Explanation</h4>
              <p className="text-slate-600 leading-relaxed text-[11px]">{activeDiff?.aiExplanation}</p>
              <div className="p-2 rounded bg-slate-50 border border-slate-100 text-[10px] space-y-1">
                <span className="font-bold text-slate-700">Confidence Score:</span>
                <p className="font-mono text-emerald-700 font-bold">{activeDiff?.confidenceScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. VALIDATION & SECURITY GATES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Validation Gate */}
        <Card>
          <CardHeader className="py-3 flex flex-row items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-sm">Validation Suite</CardTitle>
            </div>
            <Badge variant="success">Simulated Checks Passed (4/4)</Badge>
          </CardHeader>
          <CardContent className="py-2 divide-y divide-slate-100 text-xs">
            {job.validation?.checks.map((chk) => (
              <div key={chk.id} className="py-2 flex items-center justify-between">
                <span className="font-semibold text-slate-900">{chk.name}</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-400 text-[10px]">{chk.durationMs}ms</span>
                  <Badge variant="success">Passed</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security Gate */}
        <Card>
          <CardHeader className="py-3 flex flex-row items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-sm">Security SAST Gate</CardTitle>
            </div>
            <Badge variant="success">0 Blocking Findings</Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-2 text-xs">
            <p className="text-slate-600">Simulated static analysis clean. No secret leaks or injection vulnerabilities detected in generated diff.</p>
            <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-[11px]">
              ✓ Ready for Pull Request Delivery
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. HUMAN REVIEW GATE & PULL REQUEST TRIGGER */}
      <Card className="border-emerald-500 bg-emerald-50/20">
        <CardHeader className="py-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Human Review Gate</CardTitle>
            <CardDescription>Review verified patch and generate GitHub Pull Request.</CardDescription>
          </div>
          {job.pullRequest ? (
            <div className="flex items-center gap-2">
              <Badge variant="success">PR #{job.pullRequest.number} Created</Badge>
              <a href={job.pullRequest.htmlUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm">
                  View PR on GitHub <GitPullRequest className="ml-1 h-3.5 w-3.5 text-emerald-600" />
                </Button>
              </a>
            </div>
          ) : (
            <Button variant="primary" onClick={() => setIsPrOpen(true)}>
              <GitPullRequest className="mr-1.5 h-4 w-4" /> Create Pull Request
            </Button>
          )}
        </CardHeader>
      </Card>

      {/* 5. JOB TECHNICAL LOGS VIEWER */}
      <Card>
        <CardHeader className="py-3 border-b border-slate-200 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-slate-500" />
            <CardTitle className="text-xs">Job Technical Logs</CardTitle>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Execution Monospace Feed</span>
        </CardHeader>
        <CardContent className="p-3 bg-slate-950 font-mono text-[11px] text-slate-300 space-y-1 max-h-48 overflow-y-auto">
          {job.logs.map((log) => (
            <div key={log.id} className="flex items-center gap-2">
              <span className="text-slate-500">{log.timestamp}</span>
              <span className="text-sky-400 uppercase font-bold">[{log.stage}]</span>
              <span className={log.severity === 'success' ? 'text-emerald-400' : 'text-slate-200'}>{log.message}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* MODALS */}
      {/* Cancel Confirmation Modal */}
      <Dialog isOpen={isCancelOpen} onClose={() => setIsCancelOpen(false)} title="Cancel Code Job?" description="Are you sure you want to stop code patch generation?">
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={() => setIsCancelOpen(false)}>No, Keep Running</Button>
          <Button variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700" onClick={handleCancel}>Yes, Cancel Job</Button>
        </div>
      </Dialog>

      {/* Request Plan Changes Modal */}
      <Dialog isOpen={isPlanFeedbackOpen} onClose={() => setIsPlanFeedbackOpen(false)} title="Request AI Plan Re-planning" description="Provide feedback for the AI planner.">
        <form onSubmit={handleRequestPlanChanges} className="space-y-3">
          <Textarea label="Feedback / Constraints" value={planFeedback} onChange={(e) => setPlanFeedback(e.target.value)} required placeholder="e.g. Do not modify auth middleware. Use existing authorization helper." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsPlanFeedbackOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Re-generate Plan</Button>
          </div>
        </form>
      </Dialog>

      {/* Create PR Modal */}
      <Dialog isOpen={isPrOpen} onClose={() => setIsPrOpen(false)} title="Create Pull Request" description="Propose changes to repository main branch via PR.">
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1 font-mono">
            <p><strong>Base Branch:</strong> {job.branch}</p>
            <p><strong>Feature Branch:</strong> {job.featureBranch}</p>
            <p><strong>Files Changed:</strong> {job.patch?.filesChangedCount} files</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsPrOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreatePr} isLoading={isActionLoading}>
              Authorize PR Handoff
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
