'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Incident, StackFrame, LogEvent, RootCauseHypothesis } from '@/lib/types/debugging';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Textarea } from '@/components/ui/Textarea';
import {
  Bug,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  XCircle,
  FileCode,
  ShieldCheck,
  Terminal,
  Layers,
  GitPullRequest,
  History,
  RotateCcw,
  Search,
} from 'lucide-react';
import { getDebuggingService, getCodeService } from '@/lib/services/registry';

interface DebuggingConsoleClientProps {
  initialIncident: Incident;
}

export function DebuggingConsoleClient({ initialIncident }: DebuggingConsoleClientProps) {
  const router = useRouter();
  const [incident, setIncident] = React.useState<Incident>(initialIncident);
  const [isLoading, setIsLoading] = React.useState(false);
  const [activeFrameIndex, setActiveFrameIndex] = React.useState(0);
  const [logSearch, setLogSearch] = React.useState('');
  const [logLevelFilter, setLogLevelFilter] = React.useState<string>('all');
  const [diffMode, setDiffMode] = React.useState<'unified' | 'split'>('unified');

  // Modals
  const [isPlanFeedbackOpen, setIsPlanFeedbackOpen] = React.useState(false);
  const [planFeedback, setPlanFeedback] = React.useState('');
  const [isPrOpen, setIsPrOpen] = React.useState(false);

  const signal = incident.signals[0];
  const stackFrames = signal?.stackTrace || [];
  const activeFrame = stackFrames[activeFrameIndex] || stackFrames[0];
  const logs = signal?.logs || [];

  const filteredLogs = logs.filter(l => {
    const matchesSearch = l.message.toLowerCase().includes(logSearch.toLowerCase()) || l.service.toLowerCase().includes(logSearch.toLowerCase());
    const matchesLevel = logLevelFilter === 'all' || l.level === logLevelFilter;
    return matchesSearch && matchesLevel;
  });

  // 1. Root Cause Synthesis
  const handleAnalyzeRootCause = async () => {
    setIsLoading(true);
    const dbgService = getDebuggingService();
    const updated = await dbgService.analyzeRootCause(incident.id);
    setIncident(updated);
    setIsLoading(false);
  };

  // 2. Generate Plan
  const handleGeneratePlan = async () => {
    setIsLoading(true);
    const dbgService = getDebuggingService();
    const updated = await dbgService.generateRemediationPlan(incident.id);
    setIncident(updated);
    setIsLoading(false);
  };

  // 3. Approve Plan
  const handleApprovePlan = async () => {
    setIsLoading(true);
    const dbgService = getDebuggingService();
    const updated = await dbgService.approvePlan(incident.id);
    setIncident(updated);
    setIsLoading(false);
  };

  // 4. Request Plan Changes
  const handleRequestPlanChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const dbgService = getDebuggingService();
    const updated = await dbgService.requestPlanChanges(incident.id, planFeedback);
    setIncident(updated);
    setIsPlanFeedbackOpen(false);
    setIsLoading(false);
  };

  // 5. Generate Patch & Validate (Delegates to CodeService & ValidationService)
  const handleGeneratePatchAndValidate = async () => {
    setIsLoading(true);
    const dbgService = getDebuggingService();
    await dbgService.generatePatch(incident.id);
    await dbgService.validatePatch(incident.id);
    const updated = await dbgService.runSecurityReview(incident.id);
    setIncident(updated);
    setIsLoading(false);
  };

  // 6. VERIFY REGRESSION (Rule #6 Invariant Enforcement)
  const handleVerifyRegression = async () => {
    setIsLoading(true);
    const dbgService = getDebuggingService();
    const res = await dbgService.verifyRegression(incident.id);
    setIncident(res.incident);
    setIsLoading(false);
  };

  // 7. Reopen Incident
  const handleReopen = async () => {
    const dbgService = getDebuggingService();
    const updated = await dbgService.reopenIncident(incident.id);
    setIncident(updated);
  };

  // 8. Create PR (Delegates to CodeService / GitHubService)
  const handleCreatePr = async () => {
    setIsLoading(true);
    const dbgService = getDebuggingService();
    const updated = await dbgService.createPullRequest(incident.id);
    setIncident(updated);
    setIsLoading(false);
    setIsPrOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/debugging')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{incident.title}</h1>
              <Badge variant={incident.severity === 'high' || incident.severity === 'critical' ? 'danger' : 'warning'}>
                {incident.severity.toUpperCase()}
              </Badge>
              <Badge variant={incident.status === 'resolved' ? 'success' : incident.status === 'reopened' ? 'warning' : 'info'}>
                {incident.status}
              </Badge>
              <Badge variant="muted">Simulated Environment</Badge>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Repo: <strong className="text-slate-800">{incident.repositoryName}</strong> • Env: <strong className="text-slate-800">{incident.environment}</strong> • Attempt: {incident.attempts}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {incident.status === 'resolved' && (
            <Button variant="outline" size="sm" onClick={handleReopen}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reopen Incident
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleAnalyzeRootCause} title="Re-analyze Root Cause">
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Re-analyze
          </Button>
        </div>
      </div>

      {/* 4-PANEL INVESTIGATION ROOM GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 1. STACK TRACE & LOG SIGNALS CORRELATION */}
          <Card>
            <CardHeader className="py-3 border-b border-slate-200 bg-slate-50/50 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-slate-600" />
                <CardTitle className="text-xs">Stack Trace & Signal Correlation</CardTitle>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Inert Telemetry Feed</span>
            </CardHeader>
            <CardContent className="p-0 grid grid-cols-1 md:grid-cols-12 min-h-[250px]">
              {/* Stack Frames Tree (5 cols) */}
              <div className="md:col-span-5 border-r border-slate-200 p-2 space-y-1 bg-slate-50/30 text-xs">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Stack Frames</div>
                {stackFrames.map((frame, idx) => (
                  <button
                    key={frame.id}
                    onClick={() => setActiveFrameIndex(idx)}
                    className={`w-full text-left p-2 rounded flex items-center justify-between transition-colors cursor-pointer ${
                      activeFrameIndex === idx ? 'bg-emerald-50 text-emerald-900 font-semibold border-l-2 border-emerald-600' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="truncate">
                      <p className="font-mono text-[11px]">{frame.functionName}</p>
                      <span className="text-[10px] text-slate-400">{frame.file}:{frame.line}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Stack Frame Code Context (7 cols) */}
              <div className="md:col-span-7 p-4 font-mono text-xs overflow-x-auto bg-slate-950 text-slate-100 space-y-2">
                <div className="text-[11px] text-slate-400 pb-2 border-b border-slate-800 flex justify-between">
                  <span>Frame: {activeFrame?.file}:{activeFrame?.line}</span>
                  <span className="text-emerald-400 font-bold">{activeFrame?.functionName}</span>
                </div>
                <pre className="text-slate-300">
                  <code>{`39  export function verifyWorkspaceScope(req: Request) {\n40    const scope = req.headers.get("x-scope");\n41    if (!scope) {\n42 ->   throw new ForbiddenError("Missing required workspace.read claim");\n43    }\n44  }`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* 2. ROOT CAUSE ANALYSIS & HYPOTHESES (The Centerpiece) */}
          <Card className="border-sky-200 bg-sky-50/10">
            <CardHeader className="py-3 border-b border-sky-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-600" />
                <CardTitle className="text-xs">Root Cause Analysis & Hypotheses</CardTitle>
              </div>
              <Badge variant="info">Simulated AI Confidence: {incident.hypotheses[0]?.confidenceScore || 92}%</Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              {incident.hypotheses.map((hyp, idx) => (
                <div key={hyp.id} className={`p-3 rounded border space-y-2 ${hyp.isWorkingHypothesis ? 'bg-white border-sky-300 ring-1 ring-sky-200' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Hypothesis {idx + 1}: {hyp.title}</span>
                    <Badge variant={hyp.isWorkingHypothesis ? 'info' : 'muted'}>{hyp.confidenceScore}% Confidence</Badge>
                  </div>
                  <p className="text-slate-600 text-[11px]">{hyp.explanation}</p>
                  <div className="p-2 rounded bg-slate-50 text-[10px] font-mono text-slate-500 border border-slate-100">
                    Evidence: {hyp.evidenceSummary}
                  </div>
                </div>
              ))}

              {/* REMEDIATION PLAN TRIGGER */}
              {!incident.remediationPlan && (
                <div className="flex justify-end pt-2">
                  <Button variant="primary" size="sm" onClick={handleGeneratePlan} isLoading={isLoading}>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Synthesize Remediation Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 3. REMEDIATION PLAN & INERT PATCH DIFF */}
          {incident.remediationPlan && (
            <Card className="border-emerald-200 bg-emerald-50/10">
              <CardHeader className="py-3 border-b border-emerald-100 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-xs">Remediation Plan & Inert Patch Diff</CardTitle>
                </div>
                {!incident.remediationPlan.isApproved ? (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setIsPlanFeedbackOpen(true)}>
                      Request Changes
                    </Button>
                    <Button variant="primary" size="sm" className="h-7 text-xs" onClick={handleApprovePlan} isLoading={isLoading}>
                      Approve Plan
                    </Button>
                  </div>
                ) : (
                  <Badge variant="success">Plan Approved</Badge>
                )}
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <p className="font-semibold text-slate-900">{incident.remediationPlan.plannedFix}</p>

                {incident.remediationPlan.isApproved && !incident.patch && (
                  <div className="flex justify-end pt-2">
                    <Button variant="primary" size="sm" onClick={handleGeneratePatchAndValidate} isLoading={isLoading}>
                      Generate Patch & Run Validation
                    </Button>
                  </div>
                )}

                {/* Inert Code Diff Render */}
                {incident.patch && (
                  <div className="p-3 bg-slate-950 font-mono text-xs text-slate-100 rounded overflow-x-auto space-y-1">
                    <div className="text-[11px] text-slate-400 pb-1 border-b border-slate-800">
                      File: {incident.patch.fileDiffs[0]?.file}
                    </div>
                    {incident.patch.fileDiffs[0]?.chunks[0]?.lines.map((line, lIdx) => (
                      <div key={lIdx} className={line.startsWith('+') ? 'text-emerald-400' : line.startsWith('-') ? 'text-rose-400' : 'text-slate-400'}>
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 4. VALIDATION, SECURITY & REGRESSION VERIFICATION (Rule #6 Invariant!) */}
          {incident.patch && (
            <Card className="border-emerald-500 bg-emerald-50/20">
              <CardHeader className="py-3 border-b border-emerald-200 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-xs">Quality Gates & Regression Verification</CardTitle>
                </div>
                {incident.regressionCheck?.status === 'resolved' ? (
                  <Badge variant="success">✓ Regression Verified Resolved</Badge>
                ) : (
                  <Badge variant="warning">Regression Check Required</Badge>
                )}
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900">Validation Suite:</span>
                    <Badge variant="success" className="ml-2">4/4 Passed</Badge>
                  </div>
                  <div className="p-2.5 bg-white rounded border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900">Security Gate:</span>
                    <Badge variant="success" className="ml-2">0 High Findings</Badge>
                  </div>
                </div>

                {/* REGRESSION VERIFICATION TRIGGER */}
                {incident.regressionCheck?.status !== 'resolved' ? (
                  <div className="flex justify-end pt-2">
                    <Button variant="primary" size="sm" onClick={handleVerifyRegression} isLoading={isLoading}>
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Run Simulated Regression Check
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-emerald-100 rounded text-emerald-900 font-semibold">
                    <span>Simulated regression verified bug no longer reproduces. Ready for PR.</span>
                    <Button variant="primary" size="sm" onClick={() => setIsPrOpen(true)}>
                      <GitPullRequest className="mr-1.5 h-3.5 w-3.5" /> Create Pull Request
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: TIMELINE FEED & INCIDENT METADATA */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-3 border-b border-slate-100">
              <CardTitle className="text-xs">Incident Metadata</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Source Type</span>
                <span className="font-mono font-bold text-slate-900">{incident.source}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Occurrences</span>
                <span className="font-mono text-slate-900">{incident.occurrenceCount} events</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Affected Users</span>
                <span className="font-mono text-slate-900">{incident.affectedUsersCount} users</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3 border-b border-slate-100 flex flex-row items-center gap-2">
              <History className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-xs">Investigation Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-3 divide-y divide-slate-100 text-[11px]">
              {incident.timeline.map((event) => (
                <div key={event.id} className="py-2 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{event.title}</span>
                    <span className="font-mono text-[10px] text-slate-400">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-500">{event.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* REQUEST PLAN CHANGES MODAL */}
      <Dialog isOpen={isPlanFeedbackOpen} onClose={() => setIsPlanFeedbackOpen(false)} title="Request Remediation Plan Changes" description="Provide feedback for the AI investigator.">
        <form onSubmit={handleRequestPlanChanges} className="space-y-3 text-xs">
          <Textarea label="Feedback / Constraints" value={planFeedback} onChange={(e) => setPlanFeedback(e.target.value)} required placeholder="e.g. Do not modify session duration logic." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsPlanFeedbackOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Re-generate Plan</Button>
          </div>
        </form>
      </Dialog>

      {/* CREATE PR MODAL */}
      <Dialog isOpen={isPrOpen} onClose={() => setIsPrOpen(false)} title="Authorize PR Handoff" description="Propose verified incident fix to reviewable feature branch.">
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1 font-mono">
            <p><strong>Base Branch:</strong> main</p>
            <p><strong>Feature Branch:</strong> anstat/fix-inc-104</p>
            <p><strong>Files Changed:</strong> 1 file</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsPrOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreatePr} isLoading={isLoading}>
              Authorize PR Handoff
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
