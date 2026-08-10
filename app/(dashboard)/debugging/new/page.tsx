'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { ArrowLeft, Bug, Sparkles, CheckCircle2, FileCode, Layers } from 'lucide-react';
import { getDebuggingService } from '@/lib/services/registry';

export default function NewInvestigationPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form State
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [environment, setEnvironment] = React.useState<'production' | 'staging' | 'development'>('staging');
  const [repositoryId, setRepositoryId] = React.useState('repo_northstar_web_01');
  const [severity, setSeverity] = React.useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [source, setSource] = React.useState<'auth_error' | 'app_error' | 'api_error' | 'db_error'>('auth_error');
  const [errorType, setErrorType] = React.useState('ForbiddenError');
  const [rawStackTrace, setRawStackTrace] = React.useState('src/auth/middleware.ts:42 verifyWorkspaceScope\nsrc/admin/routes.ts:18 getWorkspaceSettingsHandler');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const dbgService = getDebuggingService();
    const incident = await dbgService.createIncident({
      repositoryId,
      repositoryName: 'northstar-web-platform',
      environment,
      title,
      description,
      severity,
      source,
      errorType,
      rawStackTrace,
    });
    router.push(`/debugging/${incident.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/debugging')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">New Incident Investigation</h1>
          <p className="text-xs text-slate-500">Attach signals and launch AI root cause investigation.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4 border-b border-slate-100">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900">Investigation Setup</span>
            <Badge variant="muted">Step {step} of 3</Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {step === 1 && (
              <div className="space-y-3">
                <Input label="Incident Title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Admin dashboard returning 403 Forbidden" />
                <Textarea label="Description / Symptoms" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="Describe error behavior and affected components..." />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Environment</label>
                    <select value={environment} onChange={(e) => setEnvironment(e.target.value as 'production' | 'staging' | 'development')} className="w-full h-9 rounded border border-slate-300 px-3 bg-white text-slate-900">
                      <option value="production">Production</option>
                      <option value="staging">Staging</option>
                      <option value="development">Development</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Severity</label>
                    <select value={severity} onChange={(e) => setSeverity(e.target.value as 'critical' | 'high' | 'medium' | 'low')} className="w-full h-9 rounded border border-slate-300 px-3 bg-white text-slate-900">
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button variant="primary" size="sm" type="button" onClick={() => setStep(2)}>Next: Attach Signals</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Error Type / Exception</label>
                  <Input value={errorType} onChange={(e) => setErrorType(e.target.value)} placeholder="e.g. ForbiddenError / TypeError" />
                </div>
                <Textarea label="Raw Stack Trace (Inert Text)" value={rawStackTrace} onChange={(e) => setRawStackTrace(e.target.value)} rows={5} placeholder="Paste stack trace snippet..." />
                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setStep(1)}>Back</Button>
                  <Button variant="primary" size="sm" type="button" onClick={() => setStep(3)}>Next: Context</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-3">
                <div className="p-3 bg-sky-50 rounded border border-sky-200 text-sky-900 space-y-1">
                  <span className="font-bold">Context Budget Inspector</span>
                  <p>Estimated context: 42,800 tokens across northstar-web-platform repository files.</p>
                </div>
                <div className="flex justify-between pt-2">
                  <Button variant="outline" size="sm" type="button" onClick={() => setStep(2)}>Back</Button>
                  <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
                    <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Start AI Investigation
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
