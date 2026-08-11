'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, Command, User, Settings, LogOut, Building2, Zap } from 'lucide-react';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { NotificationsDrawer } from '@/components/navigation/NotificationsDrawer';
import { getAuthService, getEntitlementService } from '@/lib/services/registry';

export function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCommandOpen, setIsCommandOpen] = React.useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [userName, setUserName] = React.useState('Shishir Kumar');
  const [userEmail, setUserEmail] = React.useState('shishir@northstarstudio.dev');
  const [userInitials, setUserInitials] = React.useState('SK');
  const [aiCreditsText, setAiCreditsText] = React.useState('125 / 300 AI Credits');
  const [planBadge, setPlanBadge] = React.useState('Starter (₹499/mo)');

  React.useEffect(() => {
    async function loadData() {
      try {
        const authService = getAuthService();
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUserName(currentUser.name || 'ANSTAT User');
          setUserEmail(currentUser.email || '');
          const initials = (currentUser.name || 'AU')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          setUserInitials(initials || 'AU');
        }

        const entitlementService = getEntitlementService();
        const summary = await entitlementService.getUsageSummary();
        setAiCreditsText(`${summary.used.aiCredits} / ${summary.limits.aiCredits} AI Credits`);
        setPlanBadge(`${summary.planName} (₹${summary.priceInrMonthly}/mo)`);
      } catch {
        // Fallback to default user & entitlement info
      }
    }
    loadData();
  }, []);

  // Generate Breadcrumbs from route path
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbItems = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/');
    const title = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
    return { title, href };
  });

  const handleSignOut = async () => {
    const authService = getAuthService();
    await authService.logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-slate-200 bg-white/90 px-4 md:px-6 backdrop-blur-md">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-xs font-medium text-slate-500">
          <span className="text-slate-400">ANSTAT</span>
          {breadcrumbItems.map((item, idx) => (
            <React.Fragment key={item.href}>
              <span className="mx-2 text-slate-300">/</span>
              <span className={idx === breadcrumbItems.length - 1 ? 'font-semibold text-slate-900' : 'hover:text-slate-700'}>
                {item.title}
              </span>
            </React.Fragment>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Quick Command Trigger (CMD+K) */}
          <button
            onClick={() => setIsCommandOpen(true)}
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 hover:border-slate-300 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Search ANSTAT...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] text-slate-400">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </button>

          {/* Entitlement Summary Meter */}
          <div className="hidden md:flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-semibold text-emerald-800">
            <Zap className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>{planBadge}</span>
            <span className="text-emerald-300">|</span>
            <span className="text-emerald-700">{aiCreditsText}</span>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          {/* User Avatar Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white font-bold text-xs ring-2 ring-slate-200 hover:ring-emerald-500 transition-all cursor-pointer"
            >
              {userInitials}
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 top-10 w-48 rounded-lg border border-slate-200 bg-white p-1 shadow-xl text-xs space-y-0.5 z-40 animate-in zoom-in-95 duration-100">
                <div className="p-2 border-b border-slate-100">
                  <p className="font-semibold text-slate-900">{userName}</p>
                  <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
                </div>
                <button
                  onClick={() => { setIsUserMenuOpen(false); router.push('/settings/profile'); }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" /> Profile Settings
                </button>
                <button
                  onClick={() => { setIsUserMenuOpen(false); router.push('/settings/workspace'); }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <Building2 className="h-3.5 w-3.5 text-slate-400" /> Workspace Settings
                </button>
                <button
                  onClick={() => { setIsUserMenuOpen(false); router.push('/settings/ai'); }}
                  className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" /> AI Engine Settings
                </button>
                <div className="border-t border-slate-100 pt-0.5 mt-0.5">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />

      {/* Notifications Drawer */}
      <NotificationsDrawer isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </>
  );
}
