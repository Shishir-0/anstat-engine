import * as React from 'react';
import Link from 'next/link';
import { getSecurityService, getGitHubService } from '@/lib/services/registry';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SecurityCenterClient } from '@/components/security/SecurityCenterClient';
import { Shield, Sparkles, AlertTriangle, CheckCircle2, History, ArrowUpRight, Lock } from 'lucide-react';

export default async function SecurityPage() {
  const securityService = getSecurityService();
  const githubService = getGitHubService();

  const posture = await securityService.getPostureSummary();
  const findingsResult = await securityService.listFindings({ limit: 50 });
  const scansResult = await securityService.listScans({ limit: 20 });
  const repos = (await githubService.listRepositories()).data;

  return (
    <SecurityCenterClient
      initialPosture={posture}
      initialFindings={findingsResult.data}
      initialScans={scansResult.data}
      repositories={repos}
    />
  );
}
