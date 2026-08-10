import * as React from 'react';
import { getDeploymentService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Rocket, Play } from 'lucide-react';

export default async function DeploymentsPage() {
  const deploymentService = getDeploymentService();
  const deployments = await deploymentService.listDeployments();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Deployment Control Plane</h1>
          <p className="text-xs text-slate-500 mt-1">Multi-environment build, test, security check & deployment pipeline.</p>
        </div>
        <Button variant="primary" size="sm">
          <Play className="mr-1.5 h-3.5 w-3.5" /> Trigger Deployment
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle>Deployment History ({deployments.total})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {deployments.data.map((dep) => (
            <div key={dep.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{dep.repositoryName}</span>
                  <Badge variant={dep.environment === 'production' ? 'danger' : 'info'}>{dep.environment}</Badge>
                  <Badge variant="success">{dep.status}</Badge>
                </div>
                <p className="text-xs text-slate-500 font-mono">Commit: {dep.commitHash} • {dep.commitMessage}</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">{Math.round((dep.durationMs || 0) / 1000)}s</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
