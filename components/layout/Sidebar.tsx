'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Code,
  Shield,
  Bug,
  GitBranch,
  Terminal,
  Rocket,
  Activity,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Proposals & SOW', href: '/proposals', icon: FileText, badge: 'AI' },
      { title: 'Clients CRM', href: '/clients', icon: Users },
    ],
  },
  {
    title: 'Engineering',
    items: [
      { title: 'Code Generation', href: '/code', icon: Code, badge: 'Diff' },
      { title: 'Security Center', href: '/security', icon: Shield },
      { title: 'Debugging Hub', href: '/debugging', icon: Bug },
      { title: 'GitHub Engine', href: '/github', icon: GitBranch },
    ],
  },
  {
    title: 'Operations',
    items: [
      { title: 'Jobs & Logs', href: '/jobs', icon: Terminal },
      { title: 'Deployments', href: '/deployments', icon: Rocket },
      { title: 'Activity Audit', href: '/activity', icon: Activity },
    ],
  },
  {
    title: 'Insights & Admin',
    items: [
      { title: 'Usage & AI Cost', href: '/usage', icon: BarChart3 },
      { title: 'Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-slate-200 bg-white transition-all duration-300 z-30 select-none h-screen sticky top-0',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header / Logo */}
      <div className="flex h-14 items-center justify-between px-4 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold shadow-xs">
            A
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-slate-900 leading-none">ANSTAT</span>
              <span className="text-[10px] font-semibold text-emerald-600 tracking-wider uppercase mt-0.5">AI ENGINE</span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Workspace Switcher */}
      <WorkspaceSwitcher isCollapsed={isCollapsed} />

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-6">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </h4>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-2.5 py-2 text-xs font-medium transition-all group',
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold border-l-2 border-emerald-600'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600')} />
                  {!isCollapsed && (
                    <div className="flex flex-1 items-center justify-between">
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer System Status & Profile */}
      <div className="border-t border-slate-100 p-3 bg-slate-50/50 space-y-2">
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-2 py-1 text-[11px] font-medium text-slate-600">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Mock Engine Active</span>
          </div>
        )}
        <div className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-slate-100 transition-colors">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white font-bold text-xs">
            SK
          </div>
          {!isCollapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xs font-medium text-slate-900 truncate">Shishir Kumar</span>
              <span className="text-[10px] text-slate-500 truncate">Owner • Northstar</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
