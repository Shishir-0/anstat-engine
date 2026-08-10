'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FileText,
  Code,
  Shield,
  Bug,
  Terminal,
  Rocket,
  Settings,
  Users,
  GitBranch,
  BarChart3,
  Building2,
  LogOut,
  X,
} from 'lucide-react';
import { getAuthService } from '@/lib/services/registry';

interface CommandItem {
  title: string;
  category: 'Quick Actions' | 'Navigation' | 'Workspace' | 'Account';
  href: string;
  icon: React.ElementType;
}

const COMMANDS: CommandItem[] = [
  // Quick Actions
  { title: '+ New Proposal & SOW', category: 'Quick Actions', href: '/proposals/new', icon: FileText },
  { title: 'Generate Code Patch', category: 'Quick Actions', href: '/code/new', icon: Code },
  { title: 'Run Security Scan', category: 'Quick Actions', href: '/security', icon: Shield },
  { title: 'Debug Stack Trace', category: 'Quick Actions', href: '/debugging', icon: Bug },
  { title: 'Trigger Deployment', category: 'Quick Actions', href: '/deployments', icon: Rocket },

  // Navigation
  { title: 'Operational Dashboard', category: 'Navigation', href: '/dashboard', icon: FileText },
  { title: 'Proposals & SOW', category: 'Navigation', href: '/proposals', icon: FileText },
  { title: 'Clients CRM', category: 'Navigation', href: '/clients', icon: Users },
  { title: 'Code Generation Engine', category: 'Navigation', href: '/code', icon: Code },
  { title: 'Security Center', category: 'Navigation', href: '/security', icon: Shield },
  { title: 'GitHub Integration', category: 'Navigation', href: '/github', icon: GitBranch },
  { title: 'Jobs & Logs Control Room', category: 'Navigation', href: '/jobs', icon: Terminal },
  { title: 'Deployments Control Plane', category: 'Navigation', href: '/deployments', icon: Rocket },
  { title: 'Usage & Cost Ledger', category: 'Navigation', href: '/usage', icon: BarChart3 },

  // Workspace & Account
  { title: 'Workspace Settings', category: 'Workspace', href: '/settings/workspace', icon: Building2 },
  { title: 'AI Engine Preferences', category: 'Workspace', href: '/settings/ai', icon: Settings },
  { title: 'GitHub Settings', category: 'Workspace', href: '/settings/github', icon: GitBranch },
  { title: 'User Profile Settings', category: 'Account', href: '/settings/profile', icon: Settings },
  { title: 'Sign Out', category: 'Account', href: '/login', icon: LogOut },
];

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredCommands = COMMANDS.filter(cmd =>
    cmd.title.toLowerCase().includes(query.toLowerCase()) || cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = async (cmd: CommandItem) => {
    if (cmd.title === 'Sign Out') {
      const authService = getAuthService();
      await authService.logout();
    }
    router.push(cmd.href);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        {/* Input Header */}
        <div className="flex items-center border-b border-slate-100 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search ANSTAT AI Engine or type a command..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            autoFocus
          />
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Command List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">No matching commands found.</div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(cmd)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                    <span className="font-medium text-slate-900">{cmd.title}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 group-hover:text-emerald-700 uppercase">
                    {cmd.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-2 text-[10px] text-slate-500">
          <span>Use arrow keys to navigate</span>
          <span className="font-mono">ESC to close</span>
        </div>
      </div>
    </div>
  );
}
