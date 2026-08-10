import { ProposalDocument, ProposalStatus, BriefInput } from '../../types/proposal';
import { PaginatedResult, PaginationParams } from '../../types/common';
import { Job } from '../../types/job';

export interface ProposalFilters extends PaginationParams {
  status?: ProposalStatus;
  clientId?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProposalService {
  list(params?: ProposalFilters): Promise<PaginatedResult<ProposalDocument>>;
  getById(id: string): Promise<ProposalDocument | null>;
  create(input: Partial<ProposalDocument>): Promise<ProposalDocument>;
  update(id: string, updates: Partial<ProposalDocument>): Promise<ProposalDocument>;
  duplicate(id: string): Promise<ProposalDocument>;
  generateFromBrief(brief: BriefInput): Promise<{ proposal: ProposalDocument; job: Job }>;
  exportDocument(id: string, format: 'pdf' | 'docx'): Promise<{ downloadUrl: string }>;
  sendProposal(id: string, emailDetails: { to: string; cc?: string; subject: string; message: string }): Promise<{ success: boolean; sentAt: string }>;
  changeStatus(id: string, status: ProposalStatus): Promise<ProposalDocument>;
  delete(id: string): Promise<boolean>;
}
