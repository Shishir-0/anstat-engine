import * as React from 'react';
import { getAuthService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Settings, Shield, Building2, Key, Bot } from 'lucide-react';

export default async function SettingsPage() {
  const authService = getAuthService();
  const org = await authService.getCurrentOrganization();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Workspace Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure agency branding, AI models, rate-cards, and integration keys.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="py-4">
            <CardTitle>Workspace & Branding</CardTitle>
            <CardDescription>Organization preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600">
            <p><strong className="text-slate-900">Organization Name:</strong> {org?.name}</p>
            <p><strong className="text-slate-900">Slug:</strong> {org?.slug}</p>
            <p><strong className="text-slate-900">Plan:</strong> Enterprise Agency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="py-4">
            <CardTitle>AI Model Configuration</CardTitle>
            <CardDescription>Configurable default models</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-xs text-slate-600">
            <p><strong className="text-slate-900">Proposal Model:</strong> Claude 3.5 Sonnet</p>
            <p><strong className="text-slate-900">Code Engine Model:</strong> ANSTAT Code Engine V2</p>
            <p><strong className="text-slate-900">Security Model:</strong> Claude 3.5 Sonnet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
