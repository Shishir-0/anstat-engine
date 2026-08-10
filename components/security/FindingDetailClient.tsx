'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { SecurityFinding } from '@/lib/types/security';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  FileCode,
  GitPullRequest,
  RefreshCw,
  XCircle,
  HelpCircle,
  History,
  Lock,
} from 'lucide-react';
import { getSecurityService, getCodeService } from '@/lib/services/registry';

interface FindingDetailClientProps {
  initialFinding: SecurityFinding;
}

export function FindingDetailClient({ initialFinding }: FindingDetailClientProps) {
  const router = useRouter();
  const [finding, setFinding] = React.useState<SecurityFinding>(initialFinding);
  const [isLoading, setIsLoading] = React.useState(false);

  // Risk Modals State
  const [isAcceptRiskOpen, setIsAcceptRiskOpen] = React.useState(false);
  const [acceptRiskReason, setAcceptRiskReason] = React.useState('');
  const [isFalsePositiveOpen, setIsFalsePositiveOpen] = React.useState(false);
  const [falsePositiveReason, setFalsePositiveReason] = React.useState('');

  // 1. Step 1: Generate Autofix Plan
  const handleGeneratePlan = async () => {
    setIsLoading(true);
    const securityService = getSecurityService();
    const updated = await securityService.generateAutofixPlan(finding.id);
    setFinding(updated);
    setIsLoading(false);
  };

  // 2. Step 2: Generate Patch & Validate
  const handleGeneratePatchAndValidate = async () => {
    setIsLoading(true);
    const securityService = getSecurityService();
    await securityService.generateAutofixPatch(finding.id);
    const updated = await securityService.validateAutofix(finding.id);
    setFinding(updated);
    setIsLoading(false);
  };

  // 3. Step 3: RUN SECURITY RESCAN (Rule #24 & #25: Only rescan marks resolved!)
  const handleRescan = async () => {
    setIsLoading(true);
    const securityService = getSecurityService();
    const res = await securityService.rescanFinding(finding.id);
    setFinding(res.finding);
    setIsLoading(false);
  };

  // 4. Accept Risk
  const handleAcceptRisk = async (e: React.FormEvent) => {
    e.preventDefault();
    const securityService = getSecurityService();
    const updated = await securityService.acceptRisk(finding.id, acceptRiskReason);
    setFinding(updated);
    setIsAcceptRiskOpen(false);
    setAcceptRiskReason('');
  };

  // 5. Mark False Positive
  const handleMarkFalsePositive = async (e: React.FormEvent) => {
    e.preventDefault();
    const securityService = getSecurityService();
    const updated = await securityService.markFalsePositive(finding.id, falsePositiveReason);
    setFinding(updated);
    setIsFalsePositiveOpen(false);
    setFalsePositiveReason('');
  };

  // 6. Create PR
  const handleCreatePr = async () => {
    const codeService = getCodeService();
    const job = await codeService.createJob({
      repositoryId: finding.repositoryId,
      repositoryName: finding.repositoryName,
      issue: { title: `Autofix: ${finding.title}`, description: finding.description, acceptanceCriteria: [finding.recommendation] },
      modelId: 'claude-3-5-sonnet',
      selectedFiles: [finding.file],
      validationLevel: 'standard',
      securityLevel: 'strict',
    });
    router.push(`/code/${job.id}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/security/scans')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{finding.title}</h1>
              <Badge variant={finding.severity === 'high' || finding.severity === 'critical' ? 'danger' : 'warning'}>
                {finding.severity.toUpperCase()}
              </Badge>
              <Badge variant={finding.status === 'resolved' ? 'success' : finding.status === 'accepted_risk' ? 'muted' : 'info'}>
                {finding.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Repo: <strong className="text-slate-800">{finding.repositoryName}</strong> • File: <strong className="text-slate-800">{finding.file}:{finding.line}</strong> • {finding.cwe}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {finding.status !== 'resolved' && (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsAcceptRiskOpen(true)}>
                Accept Risk
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsFalsePositiveOpen(true)}>
                False Positive
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 2-COLUMN MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* SAFE CODE EVIDENCE EXCERPT */}
          <Card>
            <CardHeader className="py-3 border-b border-slate-200 bg-slate-50/50">
              <CardTitle className="text-xs font-mono">Code Evidence Excerpt ({finding.file})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <pre className="p-4 bg-slate-950 font-mono text-xs text-slate-100 overflow-x-auto">
                <code>{finding.evidence.snippet}</code>
              </pre>
            </CardContent>
          </Card>

          {/* AI EXPLANATION PANEL */}
          <Card>
            <CardHeader className="py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-xs">AI Vulnerability Explanation</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs text-slate-700">
              <div>
                <strong className="text-slate-900 block mb-0.5">Root Cause:</strong>
                <p>{finding.whyItMatters || finding.description}</p>
              </div>
              <div>
                <strong className="text-slate-900 block mb-0.5">Security Impact:</strong>
                <p>{finding.impact}</p>
              </div>
              <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                <strong>Recommended Fix:</strong> {finding.recommendation}
              </div>
            </CardContent>
          </Card>

          {/* AUTOFIX & RESCAN PIPELINE (The core trust feature) */}
          <Card className="border-emerald-500 bg-emerald-50/10">
            <CardHeader className="py-3 border-b border-emerald-100 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-xs">AI Autofix & Security Rescan Pipeline</CardTitle>
              </div>
              {finding.status === 'resolved' ? (
                <Badge variant="success">Vulnerability Resolved & Rescanned Clean</Badge>
              ) : (
                <Badge variant="info">Autofix Eligible</Badge>
              )}
            </CardHeader>

            <CardContent className="p-4 space-y-4 text-xs">
              {/* STEP 1: INITIAL STATE -> GENERATE PLAN */}
              {finding.status === 'open' && !finding.autofix?.plan && (
                <div className="p-4 bg-white rounded border border-slate-200 text-center space-y-3">
                  <p className="text-slate-600">Generate an automated AI remediation plan and code patch for this finding.</p>
                  <Button variant="primary" size="sm" onClick={handleGeneratePlan} isLoading={isLoading}>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Generate Autofix Plan
                  </Button>
                </div>
              )}

              {/* STEP 2: PLAN REVIEW -> GENERATE PATCH & VALIDATE */}
              {finding.autofix?.plan && !finding.autofix.patch && (
                <div className="space-y-3 bg-white p-4 rounded border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Autofix Remediation Plan</span>
                    <Badge variant="info">Step 2 of 4</Badge>
                  </div>
                  <p className="text-slate-600">{finding.autofix.plan.plannedFix}</p>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="primary" size="sm" onClick={handleGeneratePatchAndValidate} isLoading={isLoading}>
                      Generate Patch & Run Validation
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: PATCH VALIDATED -> RUN RESCAN (Critical rule: Rescan required!) */}
              {finding.autofix?.patch && finding.status !== 'resolved' && (
                <div className="space-y-3 bg-white p-4 rounded border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Patch Validated — Rescan Required</span>
                    <Badge variant="warning">Rescan Pending</Badge>
                  </div>
                  <p className="text-slate-600">Patch passed unit tests. Run a simulated security rescan to confirm vulnerability resolution.</p>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="primary" size="sm" onClick={handleRescan} isLoading={isLoading}>
                      <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Run Security Rescan
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: RESCAN CLEAN -> RESOLVED & PR HANDOFF */}
              {finding.status === 'resolved' && (
                <div className="space-y-3 bg-emerald-50 p-4 rounded border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900">✓ Security Rescan Passed Clean</span>
                    <Badge variant="success">Resolved</Badge>
                  </div>
                  <p className="text-emerald-800">Simulated rescan verified that the vulnerability has been completely remediated.</p>
                  <Button variant="primary" size="sm" onClick={handleCreatePr}>
                    <GitPullRequest className="mr-1.5 h-3.5 w-3.5" /> Create Pull Request
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: METADATA & AUDIT HISTORY */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="py-3 border-b border-slate-100">
              <CardTitle className="text-xs">Finding Metadata</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">CWE Reference</span>
                <span className="font-mono font-bold text-slate-900">{finding.cwe || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">OWASP Category</span>
                <span className="font-mono text-[11px] text-slate-900">{finding.owasp || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Scanner Confidence</span>
                <Badge variant="info">{finding.confidence.toUpperCase()}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3 border-b border-slate-100 flex flex-row items-center gap-2">
              <History className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-xs">Audit Trail</CardTitle>
            </CardHeader>
            <CardContent className="p-3 divide-y divide-slate-100 text-[11px]">
              {finding.auditHistory.map((ah) => (
                <div key={ah.id} className="py-2 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{ah.action}</span>
                    <span className="font-mono text-[10px] text-slate-400">{new Date(ah.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-500">Actor: {ah.actor}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ACCEPT RISK MODAL */}
      <Dialog isOpen={isAcceptRiskOpen} onClose={() => setIsAcceptRiskOpen(false)} title="Accept Security Risk" description="Mark finding as Accepted Risk according to workspace security policy.">
        <form onSubmit={handleAcceptRisk} className="space-y-3 text-xs">
          <Textarea label="Business Rationale for Accepting Risk" value={acceptRiskReason} onChange={(e) => setAcceptRiskReason(e.target.value)} required placeholder="e.g. Test mock file only; risk mitigated by network isolation." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsAcceptRiskOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Confirm Accepted Risk</Button>
          </div>
        </form>
      </Dialog>

      {/* FALSE POSITIVE MODAL */}
      <Dialog isOpen={isFalsePositiveOpen} onClose={() => setIsFalsePositiveOpen(false)} title="Mark as False Positive" description="Mark finding as False Positive. Does not delete audit trail.">
        <form onSubmit={handleMarkFalsePositive} className="space-y-3 text-xs">
          <Textarea label="Reason / Technical Explanation" value={falsePositiveReason} onChange={(e) => setFalsePositiveReason(e.target.value)} required placeholder="e.g. Scanner rule misidentified mock data string as real secret." />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsFalsePositiveOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit">Confirm False Positive</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
