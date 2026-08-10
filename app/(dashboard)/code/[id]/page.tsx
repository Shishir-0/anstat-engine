import * as React from 'react';
import { getCodeService } from '@/lib/services/registry';
import { CodeConsoleClient } from '@/components/code/CodeConsoleClient';
import { notFound } from 'next/navigation';

export default async function CodeJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const codeService = getCodeService();

  const job = await codeService.getJob(id);

  // Fallback for demo navigation
  const activeJob = job || (await codeService.listJobs()).data[0];

  return <CodeConsoleClient initialJob={activeJob} />;
}
