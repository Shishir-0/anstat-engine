'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="h-full bg-slate-50 text-slate-900 font-sans flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-6 shadow-xl space-y-4 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Application Exception</h2>
            <p className="text-xs text-slate-500 mt-1">
              ANSTAT AI Engine encountered an unexpected runtime error. Your draft data is safe.
            </p>
          </div>
          {error.message && (
            <div className="p-3 bg-slate-100 rounded-md text-[11px] font-mono text-slate-700 text-left overflow-x-auto max-h-32">
              {error.message}
            </div>
          )}
          <Button variant="primary" onClick={() => reset()} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </div>
      </body>
    </html>
  );
}
