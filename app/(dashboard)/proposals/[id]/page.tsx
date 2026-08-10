import * as React from 'react';
import { getProposalService, getAuthService } from '@/lib/services/registry';
import { ProposalEditorClient } from '@/components/proposals/ProposalEditorClient';
import { notFound } from 'next/navigation';

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const proposalService = getProposalService();
  const authService = getAuthService();

  const proposal = await proposalService.getById(id);
  const organization = await authService.getCurrentOrganization();

  // Fallback for demo navigation
  const activeProposal = proposal || (await proposalService.list()).data[0];

  return (
    <ProposalEditorClient
      initialProposal={activeProposal}
      organization={organization}
    />
  );
}
