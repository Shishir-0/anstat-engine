import * as React from 'react';
import { getClientService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Users, Plus, Building2 } from 'lucide-react';

export default async function ClientsPage() {
  const clientService = getClientService();
  const clients = await clientService.list();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clients CRM</h1>
          <p className="text-xs text-slate-500 mt-1">Manage client profiles, historical revenue, and active projects.</p>
        </div>
        <Button variant="primary" size="sm">
          <Plus className="mr-1.5 h-3.5 w-3.5" /> New Client
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.data.map((client) => (
          <Card key={client.id} className="hover:border-slate-300 transition-colors">
            <CardHeader className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  <CardTitle className="text-sm">{client.name}</CardTitle>
                </div>
                <Badge variant={client.status === 'active' ? 'success' : 'muted'}>{client.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-xs text-slate-600">
              <p><strong className="text-slate-900">Industry:</strong> {client.industry}</p>
              <p><strong className="text-slate-900">Primary Contact:</strong> {client.primaryContact.name} ({client.primaryContact.email})</p>
              <div className="border-t border-slate-100 pt-2 flex items-center justify-between font-medium">
                <span>Revenue: ${client.totalRevenueUsd.toLocaleString()}</span>
                <span>{client.wonProposalsCount} Won Proposals</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
