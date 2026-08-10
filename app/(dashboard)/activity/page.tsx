import * as React from 'react';
import { getAuditService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Activity } from 'lucide-react';

export default async function ActivityPage() {
  const auditService = getAuditService();
  const events = await auditService.listEvents();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Activity Audit Stream</h1>
        <p className="text-xs text-slate-500 mt-1">Immutable operational log of all user actions, AI generations, and deployment events.</p>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle>Audit Stream ({events.total})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {events.data.map((evt) => (
            <div key={evt.id} className="p-4 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900">{evt.resourceName}</span>
                  <Badge variant="muted">{evt.action}</Badge>
                </div>
                <p className="text-slate-500">Actor: {evt.actor.userName} ({evt.actor.userEmail})</p>
              </div>
              <span className="text-slate-400 font-mono">{new Date(evt.timestamp).toLocaleString()}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
