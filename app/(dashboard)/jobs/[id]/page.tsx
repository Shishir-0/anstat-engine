import * as React from 'react';
import { getJobsService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Terminal } from 'lucide-react';
import Link from 'next/link';

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const jobsService = getJobsService();
  const job = await jobsService.getJobById(id);
  const logs = await jobsService.getJobLogs(id);

  const displayJob = job || {
    id,
    title: 'Code Generation Job',
    type: 'code_generation' as const,
    status: 'completed' as const,
    progress: 100,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/jobs">
            <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">{displayJob.title}</h1>
            <p className="text-xs text-slate-500">Job ID: {displayJob.id} • Type: {displayJob.type}</p>
          </div>
        </div>
        <Badge variant="success">{displayJob.status}</Badge>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle>Terminal Log Stream</CardTitle>
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
