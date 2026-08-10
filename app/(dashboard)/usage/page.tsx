import * as React from 'react';
import { getUsageService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart3 } from 'lucide-react';

export default async function UsagePage() {
  const usageService = getUsageService();
  const budget = await usageService.getBudgetStatus();
  const featureBreakdown = await usageService.getFeatureBreakdown();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Usage & AI Cost Ledger</h1>
        <p className="text-xs text-slate-500 mt-1">Real-time token utilization, cost allocation by feature, and budget thresholds.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs font-semibold text-slate-500">Monthly Budget</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">${budget.monthlyBudgetUsd.toLocaleString()}</h3>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-slate-500">Total Spent</p>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">${budget.usedUsd.toLocaleString()}</h3>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold text-slate-500">Remaining</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">${budget.remainingUsd.toLocaleString()}</h3>
        </Card>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle>Cost Allocation by Feature</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {featureBreakdown.map((item, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-900">{item.feature}</span>
              <span className="text-xs font-mono font-bold text-slate-900">${item.costUsd} ({item.percentage}%)</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
