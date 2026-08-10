import * as React from 'react';
import { getAuthService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default async function ProfileSettingsPage() {
  const authService = getAuthService();
  const user = await authService.getCurrentUser();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">User Profile Settings</h1>
        <p className="text-xs text-slate-500">Manage your personal account profile information.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Profile Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Full Name" defaultValue={user?.name || 'Shishir Kumar'} />
          <Input label="Email Address" defaultValue={user?.email || 'shishir@northstarstudio.dev'} disabled />
          <Button variant="primary" size="sm">Save Profile Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
