import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function SecuritySettingsPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Security & Authentication Settings</h1>
        <p className="text-xs text-slate-500">Manage 2FA, session policies, and audit log parameters.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Two-Factor Authentication</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-xs text-slate-700">
          <div className="flex items-center justify-between">
            <span>2FA Status: <strong>Enabled (TOTP Authenticator)</strong></span>
            <Badge variant="success">Active</Badge>
          </div>
          <Button variant="outline" size="sm">Manage 2FA</Button>
        </CardContent>
      </Card>
    </div>
  );
}
