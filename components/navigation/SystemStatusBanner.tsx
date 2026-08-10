'use client';

import * as React from 'react';
import { Info, X } from 'lucide-react';

export function SystemStatusBanner() {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-emerald-950 text-emerald-200 px-4 py-2 text-xs flex items-center justify-between border-b border-emerald-800">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        <Info className="h-4 w-4 text-emerald-400 shrink-0" />
        <span>
          <strong className="text-white font-semibold">ANSTAT Frontend Demo Mode:</strong> Operating on clean, type-safe mock service abstractions (<code className="bg-emerald-900 px-1 py-0.5 rounded font-mono text-[11px]">lib/services/*</code>). All operations are deterministic simulations ready for backend connection.
        </span>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="text-emerald-400 hover:text-white p-1 transition-colors"
        title="Dismiss notice"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
