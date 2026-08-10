import * as React from 'react';
import { getDebuggingService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bug, Sparkles } from 'lucide-react';

export default async function DebuggingPage() {
  const debuggingService = getDebuggingService();
  const sessions = await debuggingService.listSessions();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Debugging Hub</h1>
          <p className="text-xs text-slate-500 mt-1">AI-assisted stack trace analysis, root cause diagnosis & patch generation.</p>
        </div>
        <Button variant="primary" size="sm">
          <Bug className="mr-1.5 h-3.5 w-3.5" /> Analyze Stack Trace
        </Button>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle>Recent Debug Sessions ({sessions.total})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {sessions.data.map((sess: any) => (
            <div key={sess.id} className="p-4 space-y-2">
              <span className="text-sm font-semibold text-slate-900">{sess.problemSummary}</span>
              <p className="text-xs text-slate-600"><strong className="text-slate-900">Root Cause:</strong> {sess.rootCause}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
