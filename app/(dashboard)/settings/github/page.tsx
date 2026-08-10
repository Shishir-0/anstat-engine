import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function GitHubSettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">GitHub App Configuration</h1>
        <p className="text-xs text-slate-500">Manage GitHub App installation, permissions, and webhook sync.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>GitHub Connection Status</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <span>Installed Organization: <strong>northstar-studio</strong></span>
            <Badge variant="success">Connected</Badge>
          </div>
          <Button variant="outline" size="sm">Configure GitHub App</Button>
        </CardContent>
      </Card>
    </div>
  );
}
