import * as React from 'react';
import { getSecurityService, getGitHubService } from '@/lib/services/registry';
import { SecurityFindingsTable } from '@/components/security/SecurityFindingsTable';

export default async function SecurityScansPage() {
  const securityService = getSecurityService();
  const githubService = getGitHubService();

  const findingsResult = await securityService.listFindings({ limit: 100 });
  const scansResult = await securityService.listScans({ limit: 50 });
  const repos = (await githubService.listRepositories()).data;

  return (
    <SecurityFindingsTable
      initialFindings={findingsResult.data}
      initialScans={scansResult.data}
      repositories={repos}
    />
  );
}
