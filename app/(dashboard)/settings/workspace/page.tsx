import * as React from 'react';
import { getAuthService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default async function WorkspaceSettingsPage() {
  const authService = getAuthService();
  const org = await authService.getCurrentOrganization();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Workspace & Branding Settings</h1>
        <p className="text-xs text-slate-500">Configure agency organization details and proposal branding.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Organization Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Studio / Agency Name" defaultValue={org?.name || 'Northstar Software Studio'} />
          <Input label="Workspace Slug" defaultValue={org?.slug || 'northstar-studio'} disabled />
          <Button variant="primary" size="sm">Update Workspace</Button>
        </CardContent>
      </Card>
    </div>
  );
}
