'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Code,
  GitBranch,
  FileCode2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Shield,
  Layers,
  Bot,
  AlertTriangle,
} from 'lucide-react';
import { getCodeService, getGitHubService } from '@/lib/services/registry';
import { Repository } from '@/lib/types/github';
import { MOCK_AI_MODELS } from '@/lib/mock/seed-data';

export default function NewCodeJobPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);

  // Repositories
  const [repositories, setRepositories] = React.useState<Repository[]>([]);
  const [selectedRepoId, setSelectedRepoId] = React.useState('repo_northstar_web_01');

  // Task Input
  const [issueTitle, setIssueTitle] = React.useState('Add Role-Based Permission Guard to Admin Routes');
  const [issueDescription, setIssueDescription] = React.useState(
    'Implement checkPermission middleware check on protected admin mutation routes to prevent unauthorized role escalation.'
  );
  const [issueNumber, setIssueNumber] = React.useState(104);

  // Context Settings
  const [selectedFiles, setSelectedFiles] = React.useState<string[]>([
    'lib/auth/rbac-guard.ts',
    'app/api/admin/users/route.ts',
    'lib/types/permissions.ts',
    'middleware.ts',
  ]);
  const estimatedTokens = 42800;

  // Execution & Review Settings
  const [modelId, setModelId] = React.useState('claude-3-5-sonnet');
  const [validationLevel, setValidationLevel] = React.useState<'quick' | 'standard' | 'deep'>('standard');
  const [securityLevel, setSecurityLevel] = React.useState<'standard' | 'strict'>('strict');

  // Load Repos
  React.useEffect(() => {
    async function loadRepos() {
      const githubService = getGitHubService();
      const res = await githubService.listRepositories();
      setRepositories(res.data);
      if (res.data.length > 0) setSelectedRepoId(res.data[0].id);
    }
    loadRepos();
  }, []);

  const selectedRepo = repositories.find(r => r.id === selectedRepoId) || repositories[0];

  const handleStartJob = async () => {
    const codeService = getCodeService();
    const created = await codeService.createJob({
      repositoryId: selectedRepoId,
      repositoryName: selectedRepo?.name || 'northstar-web-platform',
      issue: {
        title: issueTitle,
        description: issueDescription,
        issueNumber,
        acceptanceCriteria: ['Sub-10ms permission check', '403 Forbidden on unauthorized role'],
      },
      modelId,
      selectedFiles,
      validationLevel,
      securityLevel,
    });

    router.push(`/code/${created.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">New AI Code Job Wizard</h1>
          <p className="text-xs text-slate-500">Repository → Task → Context → Execution → Review Gate</p>
        </div>
        <Badge variant="info">Step {step} of 6</Badge>
      </div>

      {/* STEP 1: REPOSITORY SELECTION */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-emerald-600" />
              <CardTitle>Step 1: Select Repository</CardTitle>
            </div>
            <CardDescription>Choose target repository for patch generation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {repositories.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => setSelectedRepoId(repo.id)}
                  className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedRepoId === repo.id
                      ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">{repo.name}</span>
                    <Badge variant="muted">{repo.language}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{repo.description}</p>
                  <span className="text-[10px] font-mono text-slate-400 mt-2 block">Default: {repo.defaultBranch}</span>
                </button>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="primary" onClick={() => setStep(2)}>
              Continue to Task Intake <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: TASK & ISSUE INTAKE */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5 text-emerald-600" />
              <CardTitle>Step 2: Task & Issue Specification</CardTitle>
            </div>
            <CardDescription>Define engineering requirements and target issue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Issue / Task Title"
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              required
            />
            <Textarea
              label="Engineering Task Description"
              rows={4}
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              required
            />
            <Input
              label="Optional Issue #"
              type="number"
              value={issueNumber}
              onChange={(e) => setIssueNumber(Number(e.target.value))}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
            <Button variant="primary" onClick={() => setStep(3)}>
              Build Repository Context <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 3: REPOSITORY CONTEXT BUILDER */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-emerald-600" />
                <CardTitle>Step 3: Repository Context Inspector</CardTitle>
              </div>
              <div className="text-xs font-mono font-bold text-emerald-700">
                Estimated Context: {estimatedTokens.toLocaleString()} tokens
              </div>
            </div>
            <CardDescription>Target source files selected for AST parsing and patch context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Selected Source Files</h4>
              <div className="space-y-1">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800 flex items-center justify-between">
                    <span>{file}</span>
                    <span className="text-[10px] text-emerald-700 font-sans font-semibold">✓ Matched permissions</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setStep(2)}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
            <Button variant="primary" onClick={() => setStep(4)}>
              Configure Execution <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 4: EXECUTION SETTINGS */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-emerald-600" />
              <CardTitle>Step 4: AI Model & Branch Strategy</CardTitle>
            </div>
            <CardDescription>Generated changes are proposed via an isolated reviewable branch.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Code Model</label>
              <select
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-none"
              >
                {MOCK_AI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-900 font-medium">
              ✓ Safety Guard: Proposed changes will target feature branch <strong className="font-mono">anstat/patch-104</strong>. Direct default branch push is disabled.
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setStep(3)}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
            <Button variant="primary" onClick={() => setStep(5)}>
              Review Quality Gates <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 5 & 6: REVIEW GATES & START */}
      {(step === 5 || step === 6) && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              <CardTitle>Step {step}: Review Gates & Start Job</CardTitle>
            </div>
            <CardDescription>Enforce mandatory automated tests, security checks, and human sign-off.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-700">
            <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Mandatory Quality Gates:</span>
                <Badge variant="success" className="font-mono text-[10px]">ALL ACTIVE</Badge>
              </div>
              <p>✓ TypeScript typecheck & ESLint rules validation</p>
              <p>✓ Automated unit & integration test runner</p>
              <p>✓ Static Security Analysis (SAST) finding check</p>
              <p>✓ Human Engineer sign-off required before PR creation</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
            <Button variant="primary" onClick={handleStartJob}>
              Start AI Code Job <Sparkles className="ml-1.5 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
