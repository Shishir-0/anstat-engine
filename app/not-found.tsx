import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-6 shadow-xl space-y-4 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <FileQuestion className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">404 — Page Not Found</h2>
          <p className="text-xs text-slate-500 mt-1">
            The requested ANSTAT resource or route does not exist.
          </p>
        </div>
        <Link href="/dashboard" className="block">
          <Button variant="primary" className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" /> Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
