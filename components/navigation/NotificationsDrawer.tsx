'use client';

import * as React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, Terminal } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'warning' | 'danger' | 'info';
}

const SAMPLE_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Pull Request #104 Opened',
    description: 'ANSTAT Code Engine generated RBAC middleware patch and opened PR.',
    time: '10m ago',
    type: 'success',
  },
  {
    id: 'n2',
    title: 'Security Finding Detected',
    description: 'High severity CSRF vulnerability flagged on northstar-web-platform.',
    time: '2h ago',
    type: 'danger',
  },
  {
    id: 'n3',
    title: 'Proposal Generated',
    description: 'Omnichannel B2B Portal proposal draft ready for review.',
    time: '4h ago',
    type: 'info',
  },
];

export function NotificationsDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-2xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {SAMPLE_NOTIFICATIONS.map((item) => (
            <div key={item.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">{item.title}</span>
                <span className="text-[10px] text-slate-400">{item.time}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
          <span className="text-xs text-slate-500">All notifications synced with active mock services</span>
        </div>
      </div>
    </div>
  );
}
