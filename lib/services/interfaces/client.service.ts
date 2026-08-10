import { Client } from '../../types/client';
import { PaginatedResult, PaginationParams } from '../../types/common';

export interface ClientService {
  list(params?: PaginationParams & { status?: string }): Promise<PaginatedResult<Client>>;
  getById(id: string): Promise<Client | null>;
  create(input: Partial<Client>): Promise<Client>;
  update(id: string, updates: Partial<Client>): Promise<Client>;
  delete(id: string): Promise<boolean>;
}
