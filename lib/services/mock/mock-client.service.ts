import { ClientService } from '../interfaces/client.service';
import { Client } from '../../types/client';
import { PaginatedResult, PaginationParams } from '../../types/common';
import { MOCK_CLIENTS } from '../../mock/seed-data';

export class MockClientService implements ClientService {
  private clients: Client[] = [...MOCK_CLIENTS];

  async list(params?: PaginationParams & { status?: string }): Promise<PaginatedResult<Client>> {
    let filtered = [...this.clients];
    if (params?.status) {
      filtered = filtered.filter(c => c.status === params.status);
    }
    if (params?.query) {
      const q = params.query.toLowerCase();
      filtered = filtered.filter(c => c.name.toLowerCase().includes(q) || c.companyName.toLowerCase().includes(q));
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

  async getById(id: string): Promise<Client | null> {
    return this.clients.find(c => c.id === id) || null;
  }

  async create(input: Partial<Client>): Promise<Client> {
    const newClient: Client = {
      id: `cli_${Date.now()}`,
      organizationId: 'org_anstat_01',
      name: input.name || 'New Client',
      slug: (input.name || 'new-client').toLowerCase().replace(/\s+/g, '-'),
      companyName: input.companyName || input.name || 'New Client Inc.',
      industry: input.industry || 'Technology',
      website: input.website || 'https://example.com',
      status: 'active',
      primaryContact: input.primaryContact || {
        id: `cnt_${Date.now()}`,
        name: 'John Doe',
        email: 'john@example.com',
        isPrimary: true,
      },
      contacts: [],
      projects: [],
      totalRevenueUsd: 0,
      totalProposalsCount: 0,
      wonProposalsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.clients.unshift(newClient);
    return newClient;
  }

  async update(id: string, updates: Partial<Client>): Promise<Client> {
    const index = this.clients.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Client not found');

    const updated = { ...this.clients[index], ...updates, updatedAt: new Date().toISOString() };
    this.clients[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const len = this.clients.length;
    this.clients = this.clients.filter(c => c.id !== id);
    return this.clients.length < len;
  }
}
