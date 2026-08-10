'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SecurityFinding, SecurityScan, SecurityPostureSummary } from '@/lib/types/security';
import { Repository } from '@/lib/types/github';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Shield, Sparkles, AlertTriangle, CheckCircle2, History, ArrowUpRight, Lock, Activity, RefreshCw } from 'lucide-react';
import { getSecurityService } from '@/lib/services/registry';

interface SecurityCenterClientProps {
  initialPosture: SecurityPostureSummary;
  initialFindings: SecurityFinding[];
  initialScans: SecurityScan[];
  repositories: Repository[];
}

export function SecurityCenterClient({ initialPosture, initialFindings, initialScans, repositories }: SecurityCenterClientProps) {
  const router = useRouter();
  const [posture, setPosture] = React.useState<SecurityPostureSummary>(initialPosture);
  const [findings, setFindings] = React.useState<SecurityFinding[]>(initialFindings);
  const [scans, setScans] = React.useState<SecurityScan[]>(initialScans);

  // Scan Config Modal State
  const [isScanModalOpen, setIsScanModalOpen] = React.useState(false);
  const [selectedRepoId, setSelectedRepoId] = React.useState(repositories[0]?.id || 'repo_northstar_web_01');
  const [scanProfile, setScanProfile] = React.useState<'standard' | 'strict' | 'deep'>('strict');
  const [isScanning, setIsScanning] = React.useState(false);
  const [scanProgress, setScanProgress] = React.useState(0);

  const selectedRepo = repositories.find(r => r.id === selectedRepoId) || repositories[0];

  const handleRunScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScanning(true);
    setScanProgress(10);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 30;
      });
    }, 300);

    setTimeout(async () => {
      const securityService = getSecurityService();
      const newScan = await securityService.runScan({
        repositoryId: selectedRepoId,
        repositoryName: selectedRepo?.name || 'northstar-web-platform',
        branch: 'main',
        profile: scanProfile,
      });
      setScans([newScan, ...scans]);
      setIsScanning(false);
      setIsScanModalOpen(false);
      setScanProgress(0);
    }, 1200);
  };

  const highCriticalFindings = findings.filter(f => (f.severity === 'critical' || f.severity === 'high') && f.status === 'open');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Security Center</h1>
            <Badge variant="muted">Simulated Environment</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Understand security risk across your engineering workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/security/scans">
            <Button variant="outline" size="sm">
              <History className="mr-1.5 h-3.5 w-3.5" /> Scan History
            </Button>
          </Link>
          <Button variant="primary" size="sm" onClick={() => setIsScanModalOpen(true)}>
            <Shield className="mr-1.5 h-3.5 w-3.5" /> Run Security Scan
          </Button>
        </div>
      </div>

      {/* POSTURE SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-emerald-600 bg-emerald-50/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-900 uppercase">Simulated Security Posture</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-900 font-mono">{posture.riskScore}</h3>
                <span className="text-xs text-emerald-700 font-bold">/ 100 Risk Score</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Low Overall Risk</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Lock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Critical & High Findings</p>
              <h3 className="text-2xl font-bold text-rose-600 font-mono mt-1">{posture.criticalCount + posture.highCount}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Requires Engineer Review</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Resolved Vulnerabilities</p>
              <h3 className="text-2xl font-bold text-emerald-600 font-mono mt-1">{posture.resolvedCount}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Verified by Security Rescan</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500">Accepted Risks</p>
              <h3 className="text-2xl font-bold text-slate-700 font-mono mt-1">{posture.acceptedRiskCount}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Controlled Risk Policy</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PRIORITY CRITICAL & HIGH FINDINGS SECTION */}
      <Card className="border-l-4 border-l-rose-500">
        <CardHeader className="py-3 flex flex-row items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-600" />
            <CardTitle className="text-sm">Priority Action Items ({highCriticalFindings.length})</CardTitle>
          </div>
          <Link href="/security/scans" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            All Findings ({findings.length}) <ArrowUpRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {highCriticalFindings.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No open critical or high findings!</div>
          ) : (
            highCriticalFindings.map((f) => (
              <div
                key={f.id}
                onClick={() => router.push(`/security/scans/${f.id}`)}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">{f.title}</span>
                    <Badge variant="danger">{f.severity.toUpperCase()}</Badge>
                    <Badge variant="muted">{f.cwe}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Repo: {f.repositoryName} • File: {f.file}:{f.line}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs border-rose-200 text-rose-800 hover:bg-rose-100">
                  Autofix & Rescan <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* RUN SECURITY SCAN MODAL */}
      <Dialog
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        title="Trigger Security Scan"
        description="Run simulated static analysis and dependency risk check across target repository."
      >
        <form onSubmit={handleRunScan} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Target Repository</label>
            <select
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
              className="w-full h-9 rounded border border-slate-300 px-3 bg-white text-slate-900"
            >
              {repositories.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.defaultBranch})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Scan Profile</label>
            <select
              value={scanProfile}
              onChange={(e) => setScanProfile(e.target.value as 'standard' | 'strict' | 'deep')}
              className="w-full h-9 rounded border border-slate-300 px-3 bg-white text-slate-900"
            >
              <option value="standard">Standard Scan (SAST + Secrets)</option>
              <option value="strict">Strict Scan (+ Dependency vulnerability check)</option>
              <option value="deep">Deep Security Audit (+ Configuration checks)</option>
            </select>
          </div>

          {isScanning && (
            <div className="p-3 bg-slate-50 rounded border space-y-2 text-center font-mono text-emerald-700">
              <p>Scanning source code and dependencies...</p>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full transition-all duration-200" style={{ width: `${scanProgress}%` }} />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsScanModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isScanning}>
              Start Simulated Scan
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
