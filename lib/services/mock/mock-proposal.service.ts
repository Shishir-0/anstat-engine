import { ProposalService, ProposalFilters } from '../interfaces/proposal.service';
import { ProposalDocument, ProposalStatus, BriefInput } from '../../types/proposal';
import { PaginatedResult } from '../../types/common';
import { Job } from '../../types/job';
import { MOCK_PROPOSALS } from '../../mock/seed-data';
import { getEntitlementService } from '../registry';

const VALID_STATUS_TRANSITIONS: Record<ProposalStatus, ProposalStatus[]> = {
  draft: ['generated', 'review', 'archived'],
  generated: ['review', 'sent', 'draft', 'archived'],
  review: ['sent', 'draft', 'archived'],
  sent: ['won', 'lost', 'review', 'archived'],
  won: ['archived'],
  lost: ['draft', 'archived'],
  archived: ['draft'],
};

export class MockProposalService implements ProposalService {
  private proposals: ProposalDocument[] = [...MOCK_PROPOSALS];

  async list(params?: ProposalFilters): Promise<PaginatedResult<ProposalDocument>> {
    let filtered = [...this.proposals];

    if (params?.status) {
      filtered = filtered.filter(p => p.status === params.status);
    }
    if (params?.clientId) {
      filtered = filtered.filter(p => p.clientId === params.clientId);
    }
    if (params?.query) {
      const q = params.query.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q));
    }
    if (params?.minPrice) {
      filtered = filtered.filter(p => p.totalValueUsd >= params.minPrice!);
    }
    if (params?.maxPrice) {
      filtered = filtered.filter(p => p.totalValueUsd <= params.maxPrice!);
    }

    // Sort order handling
    if (params?.sortBy === 'highest_value') {
      filtered.sort((a, b) => b.totalValueUsd - a.totalValueUsd);
    } else if (params?.sortBy === 'lowest_value') {
      filtered.sort((a, b) => a.totalValueUsd - b.totalValueUsd);
    } else if (params?.sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit) || 1,
    };
  }

  async getById(id: string): Promise<ProposalDocument | null> {
    return this.proposals.find(p => p.id === id) || null;
  }

  async create(input: Partial<ProposalDocument>): Promise<ProposalDocument> {
    const entitlementService = getEntitlementService();
    const result = await entitlementService.consumeProposal();
    if (!result.allowed) {
      const error = new Error(result.message || `Proposal creation blocked by entitlement engine: ${result.reason}`);
      (error as unknown as { code: string }).code = result.reason || 'RESOURCE_LIMIT_REACHED';
      throw error;
    }

    const newProposal: ProposalDocument = {
      id: `prop_${Date.now()}`,
      organizationId: 'org_anstat_01',
      title: input.title || 'Untitled Proposal',
      clientId: input.clientId || 'cli_vertex_01',
      clientName: input.clientName || 'Vertex Commerce',
      status: input.status || 'draft',
      totalValueUsd: input.totalValueUsd || 45000,
      currency: 'USD',
      executiveSummary: input.executiveSummary || 'Executive summary draft...',
      objectives: input.objectives || ['Deliver high performance software module'],
      requirements: input.requirements || [],
      scope: input.scope || ['Frontend interface', 'API Gateway'],
      deliverables: input.deliverables || [],
      technologyStack: input.technologyStack || ['Next.js 15', 'TypeScript', 'Tailwind CSS'],
      sections: input.sections || [],
      milestones: input.milestones || [],
      pricingBreakdown: input.pricingBreakdown || [],
      subtotalUsd: input.subtotalUsd || 45000,
      taxUsd: 0,
      discountUsd: 0,
      assumptions: input.assumptions || ['Client will provide staging API keys.'],
      risks: input.risks || [],
      outOfScope: input.outOfScope || ['Legacy data migration prior to 2022.'],
      termsAndConditions: '50% upfront payment upon contract sign-off; remaining balance milestone-based.',
      nextSteps: ['Review and sign SOW document.'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 1,
      versions: [
        { id: `v1_${Date.now()}`, versionNumber: 1, summary: 'Initial document creation', author: 'ANSTAT Engine', createdAt: new Date().toISOString() },
      ],
      exportHistory: [],
      briefInput: input.briefInput,
    };

    this.proposals.unshift(newProposal);
    return newProposal;
  }

  async update(id: string, updates: Partial<ProposalDocument>): Promise<ProposalDocument> {
    const index = this.proposals.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Proposal not found');

    const updated = {
      ...this.proposals[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.proposals[index] = updated;
    return updated;
  }

  async duplicate(id: string): Promise<ProposalDocument> {
    const original = await this.getById(id);
    if (!original) throw new Error('Original proposal not found');

    const copy = await this.create({
      ...original,
      title: `${original.title} (Copy)`,
      status: 'draft',
    });
    return copy;
  }

  async generateFromBrief(brief: BriefInput): Promise<{ proposal: ProposalDocument; job: Job }> {
    const proposal = await this.create({
      title: brief.projectTitle || 'AI-Generated Project Proposal',
      clientId: brief.clientId,
      clientName: 'Vertex Commerce',
      status: 'generated',
      executiveSummary: `Northstar Software Studio will design, build, and deploy an enterprise platform based on: ${brief.rawContent.slice(0, 150)}...`,
      briefInput: {
        rawContent: brief.rawContent,
        inputMethod: brief.inputMethod,
        completenessScore: 88,
      },
    });

    const job: Job = {
      id: `job_prop_${Date.now()}`,
      organizationId: 'org_anstat_01',
      type: 'proposal_generation',
      title: `Generate Proposal: ${brief.projectTitle}`,
      status: 'completed',
      progress: 100,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      durationMs: 4500,
      estimatedTokenCount: 18500,
      estimatedCostUsd: 0.35,
      steps: [
        { id: '1', name: 'Parsing Brief & Extracting Requirements', status: 'completed' },
        { id: '2', name: 'Synthesizing SOW & Milestones', status: 'completed' },
        { id: '3', name: 'Calculating Rate-Card Estimates', status: 'completed' },
      ],
      events: [
        { id: 'e1', timestamp: new Date().toISOString(), level: 'info', message: 'Brief parsed successfully.' },
        { id: 'e2', timestamp: new Date().toISOString(), level: 'success', message: 'Structured SOW Document generated.' },
      ],
      createdByUserId: 'user_shishir_01',
      createdByName: 'Shishir Kumar',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { proposal, job };
  }

  async exportDocument(id: string, format: 'pdf' | 'docx'): Promise<{ downloadUrl: string }> {
    const proposal = await this.getById(id);
    if (proposal) {
      proposal.exportHistory.unshift({
        id: `exp_${Date.now()}`,
        format,
        exportedAt: new Date().toISOString(),
        downloadUrl: `#mock-export-${id}.${format}`,
      });
    }
    return { downloadUrl: `#mock-export-${id}.${format}` };
  }

  async sendProposal(id: string, emailDetails: { to: string; cc?: string; subject: string; message: string }): Promise<{ success: boolean; sentAt: string }> {
    const proposal = await this.getById(id);
    const sentAt = new Date().toISOString();
    if (proposal) {
      proposal.status = 'sent';
      proposal.sentAt = sentAt;
    }
    return { success: true, sentAt };
  }

  async changeStatus(id: string, status: ProposalStatus): Promise<ProposalDocument> {
    const proposal = await this.getById(id);
    if (!proposal) throw new Error('Proposal not found');

    const allowed = VALID_STATUS_TRANSITIONS[proposal.status] || [];
    if (!allowed.includes(status) && status !== proposal.status) {
      // Guard against invalid transition if needed
    }

    return this.update(id, { status });
  }

  async delete(id: string): Promise<boolean> {
    const initialLen = this.proposals.length;
    this.proposals = this.proposals.filter(p => p.id !== id);
    return this.proposals.length < initialLen;
  }
}
