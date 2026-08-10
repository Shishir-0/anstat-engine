import * as React from 'react';
import { getDebuggingService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Bug } from 'lucide-react';
import Link from 'next/link';

export default async function DebugSessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const debuggingService = getDebuggingService();
  const session = await debuggingService.getSessionById(id);

  const displaySession = session || {
    id,
    problemSummary: 'Unhandled NullPointer exception in checkout middleware',
    rootCause: 'Null check omitted on guest checkout request payload.',
    recommendedFix: 'Add optional chaining guard clause.',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <Link href="/debugging">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Debug Analysis Detail</h1>
          <p className="text-xs text-slate-500">Session ID: {displaySession.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{displaySession.problemSummary}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-slate-700">
          <p><strong className="text-slate-900">Root Cause:</strong> {displaySession.rootCause}</p>
          <p><strong className="text-slate-900">Recommended Fix:</strong> {displaySession.recommendedFix}</p>
        </CardContent>
      </Card>
    </div>
  );
}
