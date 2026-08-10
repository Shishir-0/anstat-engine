import * as React from 'react';
import { getSecurityService } from '@/lib/services/registry';
import { FindingDetailClient } from '@/components/security/FindingDetailClient';
import { notFound } from 'next/navigation';

export default async function FindingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const securityService = getSecurityService();

  const finding = await securityService.getFinding(id);

  // Fallback for demo navigation
  const activeFinding = finding || (await securityService.listFindings()).data[0];

  return <FindingDetailClient initialFinding={activeFinding} />;
}
