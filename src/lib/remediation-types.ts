export interface RemediationItem {
  id: string;
  scenario_id: string | null;
  title: string;
  description: string;
  finding_type: string;
  severity: string;
  status: string;
  resolution_type: string | null;
  resolution_notes: string | null;
  source_system: string;
  application_name: string;
  entitlement_name: string;
  affected_user: string;
  owner: string;
  due_date: string | null;
  resolved_at: string | null;
  verified_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StatusHistoryEntry {
  id: number;
  remediation_item_id: string;
  from_status: string;
  to_status: string;
  actor: string;
  comment: string;
  resolution_type: string | null;
  created_at: string;
}

export interface EvidenceRecord {
  id: number;
  remediation_item_id: string;
  evidence_type: string;
  description: string;
  file_url: string;
  source_system: string;
  uploaded_by: string;
  created_at: string;
}

export interface SlaPolicy {
  id: number;
  finding_type: string;
  severity: string;
  due_in_days: number;
  escalation_after_days: number;
}

export const STATUSES = ['open', 'in_progress', 'blocked', 'resolved', 'verified', 'closed'] as const;

export const SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;

export const FINDING_TYPES = [
  'excessive_privilege',
  'orphaned_account',
  'stale_access',
  'mfa_disabled',
  'unauthorized_access',
  'policy_violation',
  'other',
] as const;

export const RESOLUTION_TYPES = ['revoked', 'modified', 'documented', 'exception', 'false_positive'] as const;

export const EVIDENCE_TYPES = ['screenshot', 'log_export', 'config_change', 'attestation', 'external_link'] as const;

export const SEVERITY_BADGES: Record<string, string> = {
  critical: 'badge-red',
  high: 'badge-yellow',
  medium: 'badge-blue',
  low: 'badge-gray',
};

export const STATUS_BADGES: Record<string, string> = {
  open: 'badge-blue',
  in_progress: 'badge-yellow',
  blocked: 'badge-red',
  resolved: 'badge-purple',
  verified: 'badge-green',
  closed: 'badge-gray',
};

export function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatFindingType(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
