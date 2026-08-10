import * as React from 'react';
import { getDebuggingService } from '@/lib/services/registry';
import { DebuggingConsoleClient } from '@/components/debugging/DebuggingConsoleClient';

export default async function DebuggingConsolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dbgService = getDebuggingService();

  const incident = await dbgService.getIncident(id);
  const activeIncident = incident || (await dbgService.listIncidents()).data[0];

  return <DebuggingConsoleClient initialIncident={activeIncident} />;
}
