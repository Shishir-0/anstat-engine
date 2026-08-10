import * as React from 'react';
import { getJobsService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Terminal } from 'lucide-react';

export default async function JobsPage() {
  const jobsService = getJobsService();
  const jobs = await jobsService.listJobs();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Jobs & Logs Operational Control Room</h1>
          <p className="text-xs text-slate-500 mt-1">Universal lifecycle orchestration across proposal, code, security, and deployment workers.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle>All Active & Historic Jobs ({jobs.total})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {jobs.data.map((job) => (
            <div key={job.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{job.title}</span>
                  <Badge variant={job.status === 'completed' ? 'success' : 'info'}>{job.status}</Badge>
                </div>
                <p className="text-xs text-slate-500 font-mono">Type: {job.type} • Progress: {job.progress}%</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">{new Date(job.startedAt || job.createdAt).toLocaleTimeString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
