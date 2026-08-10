import { AuditEvent } from '../../types/audit';
import { PaginatedResult, PaginationParams } from '../../types/common';

export interface AuditService {
  listEvents(params?: PaginationParams & { resourceType?: string; result?: string }): Promise<PaginatedResult<AuditEvent>>;
  logEvent(event: Omit<AuditEvent, 'id' | 'timestamp' | 'organizationId'>): Promise<AuditEvent>;
}
