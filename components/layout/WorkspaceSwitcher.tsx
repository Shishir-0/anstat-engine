'use client';

import * as React from 'react';
import { Building2, Check, ChevronDown, Plus, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { getAuthService } from '@/lib/services/registry';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface WorkspaceItem {
  id: string;
  name: string;
  plan: string;
}

const WORKSPACES: WorkspaceItem[] = [
  { id: 'org_anstat_01', name: 'Northstar Studio', plan: 'Agency' },
  { id: 'org_personal_02', name: 'Personal Dev Workspace', plan: 'Growth' },
];

export function WorkspaceSwitcher({ isCollapsed }: { isCollapsed: boolean }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [currentId, setCurrentId] = React.useState('org_anstat_01');
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [newOrgName, setNewOrgName] = React.useState('');

  const currentOrg = WORKSPACES.find(w => w.id === currentId) || WORKSPACES[0];

  const handleSelect = async (id: string) => {
    setCurrentId(id);
    setIsOpen(false);
    const authService = getAuthService();
    await authService.switchWorkspace(id);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    const newId = `org_${Date.now()}`;
    WORKSPACES.push({ id: newId, name: newOrgName, plan: 'Agency' });
    setCurrentId(newId);
    setNewOrgName('');
    setIsCreateOpen(false);
  };

  if (isCollapsed) {
    return (
      <div className="p-3 border-b border-slate-100 flex justify-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-emerald-600 hover:bg-slate-50 transition-colors"
          title={currentOrg.name}
        >
          <Building2 className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative p-3 border-b border-slate-100 bg-slate-50/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:border-slate-300 transition-all cursor-pointer"
      >
        <div className="flex items-center gap-2 truncate">
          <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="truncate font-semibold text-slate-900">{currentOrg.name}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
            {currentOrg.plan}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </button>

      {/* Workspace Dropdown */}
      {isOpen && (
        <div className="absolute left-3 right-3 top-13 z-40 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl animate-in zoom-in-95 duration-100 space-y-1">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Workspaces
          </div>
          {WORKSPACES.map((ws) => (
            <button
              key={ws.id}
              onClick={() => handleSelect(ws.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-xs transition-colors cursor-pointer',
                ws.id === currentId
                  ? 'bg-emerald-50 text-emerald-900 font-semibold'
                  : 'text-slate-700 hover:bg-slate-100'
              )}
            >
              <div className="flex items-center gap-2 truncate">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span className="truncate">{ws.name}</span>
              </div>
              {ws.id === currentId && <Check className="h-3.5 w-3.5 text-emerald-600" />}
            </button>
          ))}
          <div className="border-t border-slate-100 pt-1 mt-1">
            <button
              onClick={() => { setIsOpen(false); setIsCreateOpen(true); }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-emerald-600 hover:bg-emerald-50 font-medium transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Workspace</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Workspace Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Workspace"
        description="Establish an isolated workspace for client software delivery."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Workspace / Studio Name"
            placeholder="Apex Digital Labs"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Create Workspace
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
