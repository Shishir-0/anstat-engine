import * as React from 'react';
import { getClientService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Building2 } from 'lucide-react';
import Link from 'next/link';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clientService = getClientService();
  const client = await clientService.getById(id);

  const displayClient = client || {
    id,
    name: 'Vertex Commerce',
    industry: 'E-commerce',
    totalRevenueUsd: 285000,
    primaryContact: { name: 'Sarah Jenkins', email: 'sarah@vertexcommerce.com' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <Link href="/clients">
          <Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{displayClient.name}</h1>
          <p className="text-xs text-slate-500">Client Profile • ID: {displayClient.id}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-slate-700">
          <p><strong className="text-slate-900">Industry:</strong> {displayClient.industry}</p>
          <p><strong className="text-slate-900">Total Revenue:</strong> ${displayClient.totalRevenueUsd.toLocaleString()}</p>
          <p><strong className="text-slate-900">Contact:</strong> {displayClient.primaryContact.name} ({displayClient.primaryContact.email})</p>
        </CardContent>
      </Card>
    </div>
  );
}
