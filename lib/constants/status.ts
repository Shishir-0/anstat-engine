import { JobStatus } from '../types/job';
import { StatusMeta } from '../types/common';
import { SecuritySeverity, FindingStatus } from '../types/security';

export const STATUS_META_MAP: Record<JobStatus, StatusMeta> = {
  queued: {
    label: 'Queued',
    variant: 'muted',
    description: 'Task is waiting in the operational queue for worker allocation.',
  },
  running: {
    label: 'Running',
    variant: 'info',
    description: 'AI model execution or pipeline validation is actively in progress.',
  },
  processing: {
    label: 'Processing',
    variant: 'info',
    description: 'Parsing code context, scanning vectors, or synthesizing outputs.',
  },
  analyzing: {
    label: 'Analyzing Context',
    variant: 'info',
    description: 'AST parser building repository context graph.',
  },
  planning: {
    label: 'AI Planning',
    variant: 'info',
    description: 'AI planner synthesizing step-by-step patch implementation plan.',
  },
  generating: {
    label: 'Generating Patch',
    variant: 'info',
    description: 'Code generator synthesizing structured diff patch.',
  },
  validating: {
    label: 'Validating',
    variant: 'info',
    description: 'Running TypeScript compiler, ESLint, and test suite.',
  },
  scanning: {
    label: 'Security Scan',
    variant: 'info',
    description: 'Static analysis (SAST) vulnerability scan in progress.',
  },
  completed: {
    label: 'Completed',
    variant: 'success',
    description: 'Task executed successfully with validated output artifacts.',
  },
  failed: {
    label: 'Failed',
    variant: 'danger',
    description: 'Task execution encountered an unhandled error or validation failure.',
  },
  cancelled: {
    label: 'Cancelled',
    variant: 'muted',
    description: 'Task was cancelled by user request or automated safety threshold.',
  },
  needs_review: {
    label: 'Needs Review',
    variant: 'warning',
    description: 'AI output generated successfully and requires human engineer sign-off.',
  },
  blocked: {
    label: 'Blocked',
    variant: 'danger',
    description: 'Dependency constraint, failed test, or security finding is blocking progress.',
  },
};

export const PROPOSAL_STATUS_META = {
  draft: { label: 'Draft', variant: 'muted' },
  generated: { label: 'AI Generated', variant: 'info' },
  review: { label: 'In Review', variant: 'warning' },
  sent: { label: 'Sent to Client', variant: 'warning' },
  won: { label: 'Won', variant: 'success' },
  lost: { label: 'Lost', variant: 'danger' },
  archived: { label: 'Archived', variant: 'muted' },
} as const;

export const SEVERITY_META = {
  critical: { label: 'Critical', variant: 'danger' },
  high: { label: 'High', variant: 'danger' },
  medium: { label: 'Medium', variant: 'warning' },
  low: { label: 'Low', variant: 'info' },
  info: { label: 'Info', variant: 'muted' },
} as const;

export interface SecurityPolicyResult {
  blocksPr: boolean;
  requiresReview: boolean;
  policyLabel: string;
}

export function getCentralizedSecurityPolicy(severity: SecuritySeverity, status: FindingStatus): SecurityPolicyResult {
  if (status === 'resolved') {
    return { blocksPr: false, requiresReview: false, policyLabel: 'Resolved (Vulnerability Clean)' };
  }
  if (status === 'accepted_risk') {
    return { blocksPr: false, requiresReview: false, policyLabel: 'Accepted Risk (Controlled Policy)' };
  }
  if (status === 'false_positive') {
    return { blocksPr: false, requiresReview: false, policyLabel: 'False Positive (Audited)' };
  }
  if (severity === 'critical' || severity === 'high') {
    return { blocksPr: true, requiresReview: true, policyLabel: 'Blocks Pull Request Handoff' };
  }
  if (severity === 'medium') {
    return { blocksPr: false, requiresReview: true, policyLabel: 'Requires Engineer Review' };
  }
  return { blocksPr: false, requiresReview: false, policyLabel: 'Informational' };
}
