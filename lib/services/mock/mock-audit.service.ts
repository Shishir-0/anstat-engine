import { AuditService } from '../interfaces/audit.service';
import { AuditEvent } from '../../types/audit';
import { PaginatedResult, PaginationParams } from '../../types/common';
import { MOCK_AUDIT_EVENTS } from '../../mock/seed-data';

export class MockAuditService implements AuditService {
  private events: AuditEvent[] = [...MOCK_AUDIT_EVENTS];

  async listEvents(params?: PaginationParams & { resourceType?: string; result?: string }): Promise<PaginatedResult<AuditEvent>> {
    let filtered = [...this.events];
    if (params?.resourceType) {
      filtered = filtered.filter(e => e.resourceType === params.resourceType);
    }
    if (params?.result) {
      filtered = filtered.filter(e => e.result === params.result);
    }
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;

    return {
      data: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit) || 1,
    };
  }

  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp' | 'organizationId'>): Promise<AuditEvent> {
    const newEvent: AuditEvent = {
      ...event,
      id: `evt_${Date.now()}`,
      organizationId: 'org_anstat_01',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.events.unshift(newEvent);
    return newEvent;
  }
}
