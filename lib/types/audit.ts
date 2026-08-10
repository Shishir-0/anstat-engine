import { BaseEntity } from './common';

export type AuditActionType =
  | 'auth.login'
  | 'auth.logout'
  | 'proposal.generated'
  | 'proposal.exported'
  | 'proposal.status_changed'
  | 'code.generated'
  | 'code.pr_created'
  | 'security.scan_started'
  | 'security.scan_completed'
  | 'security.autofix_triggered'
  | 'debugging.analyzed'
  | 'github.repo_connected'
  | 'deployment.triggered'
  | 'deployment.status_changed'
  | 'settings.updated';

export interface AuditEvent extends BaseEntity {
  actor: {
    userId: string;
    userName: string;
    userEmail: string;
    role: string;
  };
  action: AuditActionType;
  resourceType: 'proposal' | 'client' | 'code' | 'security' | 'debugging' | 'github' | 'deployment' | 'workspace';
  resourceId: string;
  resourceName: string;
  timestamp: string;
  result: 'success' | 'failure' | 'warning';
  ipAddress?: string;
  metadata?: Record<string, unknown>;
}
