'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import {
  Sparkles,
  CheckCircle2,
  Building2,
  UserCheck,
  DollarSign,
  Bot,
  GitBranch,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { MOCK_AI_MODELS } from '@/lib/mock/seed-data';

interface RateCardItem {
  role: string;
  hourlyRateUsd: number;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);

  // Step 2: Workspace Data
  const [workspaceName, setWorkspaceName] = React.useState('Northstar Software Studio');
  const [industry, setIndustry] = React.useState('Software & Web Development');
  const [website, setWebsite] = React.useState('https://northstarstudio.dev');
  const [currency, setCurrency] = React.useState('USD');

  // Step 3: Profile Data
  const [profileName, setProfileName] = React.useState('Shishir Kumar');
  const [profileRole, setProfileRole] = React.useState('Agency Owner');

  // Step 4: Rate Card Data
  const [rateCards, setRateCards] = React.useState<RateCardItem[]>([
    { role: 'Frontend Engineer', hourlyRateUsd: 125 },
    { role: 'Backend Specialist', hourlyRateUsd: 150 },
    { role: 'AI Systems Architect', hourlyRateUsd: 225 },
    { role: 'UI/UX Designer', hourlyRateUsd: 110 },
  ]);

  // Step 5: AI Model Preferences
  const [proposalModel, setProposalModel] = React.useState('claude-3-5-sonnet');
  const [codeModel, setCodeModel] = React.useState('anstat-code-deepseek');
  const [securityModel, setSecurityModel] = React.useState('claude-3-5-sonnet');

  // Step 6: GitHub Connection State
  const [isGitHubConnected, setIsGitHubConnected] = React.useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = React.useState(false);

  const totalSteps = 7;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      router.push('/dashboard');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const estimatedProposalCalculation = rateCards.reduce((acc, curr) => acc + curr.hourlyRateUsd * 40, 0);

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-6">
      {/* Header & Progress Indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-xs">
              A
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ANSTAT ONBOARDING</span>
          </div>
          <span className="text-xs font-mono font-medium text-slate-500">
            Step {currentStep} of {totalSteps}
          </span>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: WELCOME */}
      {currentStep === 1 && (
        <Card className="animate-in fade-in duration-200">
          <CardHeader className="text-center py-6">
            <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Your AI Delivery Workspace</CardTitle>
            <CardDescription className="max-w-md mx-auto mt-1">
              ANSTAT AI ENGINE unites proposal SOW generation, automated code delivery, security scanning, and operational observability into one studio platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-4">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Proposal & SOW Engine:</strong> Generate rate-card backed deliverables and client documents.
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Code & Security Orchestration:</strong> Diff-first patch generation, SAST checks, and PR delivery.
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
              Skip to Dashboard
            </Button>
            <Button variant="primary" onClick={handleNext}>
              Set Up Workspace <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: WORKSPACE IDENTITY */}
      {currentStep === 2 && (
        <Card className="animate-in fade-in duration-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600" />
              <CardTitle>Workspace Identity</CardTitle>
            </div>
            <CardDescription>Define your agency organization and default currency.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Studio / Workspace Name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              />
              <Input
                label="Website URL"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            {/* Live Workspace Preview Badge */}
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Workspace Preview</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">{workspaceName}</span>
                <Badge variant="success">Agency Plan</Badge>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
            <Button variant="primary" onClick={handleNext}>
              Continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 3: PROFILE */}
      {currentStep === 3 && (
        <Card className="animate-in fade-in duration-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-600" />
              <CardTitle>Engineer Profile</CardTitle>
            </div>
            <CardDescription>Configure your identity metadata within the workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Your Full Name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-700">Primary Role</label>
              <select
                value={profileRole}
                onChange={(e) => setProfileRole(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Agency Owner">Agency Owner / Principal</option>
                <option value="Engineering Lead">Engineering Lead / Architect</option>
                <option value="Senior Developer">Senior Software Engineer</option>
                <option value="Project Manager">Project / Delivery Manager</option>
                <option value="Founder">Founder</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
            <Button variant="primary" onClick={handleNext}>
              Continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 4: RATE CARD */}
      {currentStep === 4 && (
        <Card className="animate-in fade-in duration-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              <CardTitle>Rate Card Configuration</CardTitle>
            </div>
            <CardDescription>Default hourly billing rates for ProposalOS calculations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {rateCards.map((rc, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-md border border-slate-200 bg-white">
                  <span className="flex-1 text-xs font-semibold text-slate-900">{rc.role}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-400">$</span>
                    <input
                      type="number"
                      value={rc.hourlyRateUsd}
                      onChange={(e) => {
                        const newCards = [...rateCards];
                        newCards[idx].hourlyRateUsd = Number(e.target.value);
                        setRateCards(newCards);
                      }}
                      className="w-20 rounded border border-slate-300 px-2 py-1 text-xs font-mono font-bold text-slate-900"
                    />
                    <span className="text-xs text-slate-500">/hr</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Estimated Proposal Cost Preview */}
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <span className="font-medium text-emerald-900">Sample 1-Month Team Estimate:</span>
              <span className="font-bold font-mono text-emerald-700">${estimatedProposalCalculation.toLocaleString()} USD</span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
            <Button variant="primary" onClick={handleNext}>
              Continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 5: AI PREFERENCES */}
      {currentStep === 5 && (
        <Card className="animate-in fade-in duration-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-emerald-600" />
              <CardTitle>AI Model Preferences</CardTitle>
            </div>
            <CardDescription>Select default language models for workflow engines.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Proposal Engine Model</label>
                <select
                  value={proposalModel}
                  onChange={(e) => setProposalModel(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {MOCK_AI_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.provider.toUpperCase()}) — {m.contextWindow / 1000}k ctx</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Code Generation Engine Model</label>
                <select
                  value={codeModel}
                  onChange={(e) => setCodeModel(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {MOCK_AI_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.provider.toUpperCase()}) — {m.contextWindow / 1000}k ctx</option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2.5 rounded border border-slate-100">
              Note: Model availability and token quotas are managed at the workspace registry level. No personal API keys are required.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
            <Button variant="primary" onClick={handleNext}>
              Continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 6: GITHUB CONNECTION */}
      {currentStep === 6 && (
        <Card className="animate-in fade-in duration-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-emerald-600" />
              <CardTitle>GitHub Integration</CardTitle>
            </div>
            <CardDescription>Connect GitHub to enable automated pull request delivery.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center py-4">
            {isGitHubConnected ? (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check className="h-5 w-5" />
                </div>
                <h4 className="text-sm font-semibold text-emerald-900">GitHub App Connected</h4>
                <p className="text-xs text-emerald-700">Organization <strong className="font-mono">northstar-studio</strong> linked with 2 repositories available.</p>
              </div>
            ) : (
              <div className="p-6 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 space-y-3">
                <GitBranch className="h-8 w-8 text-slate-400 mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-slate-900">GitHub App Not Connected</h4>
                  <p className="text-[11px] text-slate-500">Connect to synchronize repositories, branches, and automated PR delivery.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsGitHubModalOpen(true)}>
                  Connect GitHub App
                </Button>
              </div>
            )}

            {/* Connection Modal */}
            <Dialog
              isOpen={isGitHubModalOpen}
              onClose={() => setIsGitHubModalOpen(false)}
              title="Connect GitHub Organization"
              description="Authorizing ANSTAT AI Engine for repository access."
            >
              <div className="space-y-4 text-xs text-slate-600">
                <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <strong className="text-slate-900">Requested Permissions:</strong>
                  <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                    <li>Repository metadata & contents</li>
                    <li>Issues and Pull Requests (Read & Write)</li>
                    <li>Branch creation & commit signatures</li>
                  </ul>
                </div>
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded">
                  Notice: No repository changes are executed without human engineer approval.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsGitHubModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setIsGitHubConnected(true);
                      setIsGitHubModalOpen(false);
                    }}
                  >
                    Authorize Mock GitHub Sync
                  </Button>
                </div>
              </div>
            </Dialog>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleBack}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
            <Button variant="primary" onClick={handleNext}>
              Continue <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 7: COMPLETE */}
      {currentStep === 7 && (
        <Card className="animate-in zoom-in-95 duration-200">
          <CardHeader className="text-center py-6">
            <div className="mx-auto mb-2 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Your Workspace is Ready</CardTitle>
            <CardDescription className="mt-1">
              Configuration complete for <strong className="text-slate-900">{workspaceName}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600 border-t border-slate-100 pt-4">
            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Workspace</span>
                <p className="font-semibold text-slate-900">{workspaceName}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Primary Role</span>
                <p className="font-semibold text-slate-900">{profileRole}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Rate Card Roles</span>
                <p className="font-semibold text-slate-900">{rateCards.length} Defined</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">GitHub Status</span>
                <p className="font-semibold text-emerald-600">{isGitHubConnected ? 'Connected' : 'Simulated'}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" size="sm" onClick={() => router.push('/settings')}>
              Review Settings
            </Button>
            <Button variant="primary" onClick={() => router.push('/dashboard')}>
              Open Dashboard Command Center <Sparkles className="ml-1.5 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
