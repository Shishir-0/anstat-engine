import * as React from 'react';
import { getDebuggingService, getGitHubService } from '@/lib/services/registry';
import { DebuggingCenterClient } from '@/components/debugging/DebuggingCenterClient';

export default async function DebuggingPage() {
  const debuggingService = getDebuggingService();
  const githubService = getGitHubService();

  const incidentsResult = await debuggingService.listIncidents({ limit: 50 });
  const repos = (await githubService.listRepositories()).data;

  return (
    <DebuggingCenterClient
      initialIncidents={incidentsResult.data}
      repositories={repos}
    />
  );
}
