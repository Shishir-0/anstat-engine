import * as React from 'react';
import { SystemStatusBanner } from '@/components/navigation/SystemStatusBanner';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SystemStatusBanner />
      <div className="flex-1 flex items-center justify-center p-4">
        {children}
      </div>
    </div>
  );
}
