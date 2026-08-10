import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AISettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">AI Engine Preferences</h1>
        <p className="text-xs text-slate-500">Configure default LLM models for proposals, code engine, and security.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Default AI Models</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-700">
          <p><strong className="text-slate-900">Proposals Model:</strong> Claude 3.5 Sonnet</p>
          <p><strong className="text-slate-900">Code Generation Model:</strong> ANSTAT Code Engine V2</p>
          <p><strong className="text-slate-900">Security Model:</strong> Claude 3.5 Sonnet</p>
        </CardContent>
      </Card>
    </div>
  );
}
