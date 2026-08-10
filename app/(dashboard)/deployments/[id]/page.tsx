import * as React from 'react';
import { getDeploymentService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Rocket } from 'lucide-react';
import Link from 'next/link';

export default async function DeploymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deploymentService = getDeploymentService();
  const deployment = await deploymentService.getById(id);
  const logs = await deploymentService.getLogs(id);

  const displayDep = deployment || {
    id,
    repositoryName: 'northstar-web-platform',
    environment: 'production' as const,
    status: 'passed' as const,
    commitHash: 'a8f910c',
    isSimulated: true,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/deployments">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Deployment Detail: {displayDep.repositoryName}</h1>
            <p className="text-xs text-slate-500">Environment: {displayDep.environment} • Commit: {displayDep.commitHash}</p>
          </div>
        </div>
        <Badge variant="success">Passed (Simulated)</Badge>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle>Build & Deploy Output Logs</CardTitle>
        </CardHeader>
        <CardContent className="p-4 bg-slate-900 text-slate-100 rounded-b-lg font-mono text-xs space-y-1 overflow-x-auto">
          {logs.map((line, idx) => (
            <div key={idx} className="whitespace-pre-wrap">{line}</div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
