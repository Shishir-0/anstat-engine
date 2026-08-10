export type PermissionKey =
  | 'proposal.read'
  | 'proposal.create'
  | 'proposal.update'
  | 'proposal.delete'
  | 'proposal.export'
  | 'code.create'
  | 'code.read'
  | 'security.scan'
  | 'security.autofix'
  | 'github.connect'
  | 'github.manage'
  | 'deployment.create'
  | 'deployment.production'
  | 'workspace.manage'
  | 'billing.manage';

export const ROLE_PERMISSIONS: Record<string, PermissionKey[]> = {
  owner: [
    'proposal.read',
    'proposal.create',
    'proposal.update',
    'proposal.delete',
    'proposal.export',
    'code.create',
    'code.read',
    'security.scan',
    'security.autofix',
    'github.connect',
    'github.manage',
    'deployment.create',
    'deployment.production',
    'workspace.manage',
    'billing.manage',
  ],
  admin: [
    'proposal.read',
    'proposal.create',
    'proposal.update',
    'proposal.export',
    'code.create',
    'code.read',
    'security.scan',
    'security.autofix',
    'github.connect',
    'github.manage',
    'deployment.create',
    'deployment.production',
    'workspace.manage',
  ],
  lead_engineer: [
    'proposal.read',
    'proposal.create',
    'proposal.export',
    'code.create',
    'code.read',
    'security.scan',
    'security.autofix',
    'github.connect',
    'deployment.create',
    'deployment.production',
  ],
  engineer: [
    'proposal.read',
    'code.create',
    'code.read',
    'security.scan',
    'deployment.create',
  ],
  viewer: [
    'proposal.read',
    'code.read',
  ],
};
