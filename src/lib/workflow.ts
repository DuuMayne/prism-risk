/**
 * Status transition rules and workflow logic for PRISM remediation.
 * Single source of truth for what transitions are allowed.
 * Ported from REMEDY with simplifications for single-user context.
 */

export type Status = 'open' | 'in_progress' | 'blocked' | 'resolved' | 'verified' | 'closed';

export type ResolutionType = 'revoked' | 'modified' | 'documented' | 'exception' | 'false_positive';

const ALLOWED_TRANSITIONS: Record<Status, Status[]> = {
  open:        ['in_progress', 'blocked', 'resolved'],
  in_progress: ['blocked', 'resolved'],
  blocked:     ['in_progress', 'resolved'],
  resolved:    ['verified', 'in_progress', 'blocked'],
  verified:    ['closed'],
  closed:      [],
};

export function isValidTransition(from: Status, to: Status): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function getAvailableTransitions(currentStatus: Status): Status[] {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
}

export interface TransitionValidation {
  valid: boolean;
  error?: string;
}

export function validateTransition(
  fromStatus: Status,
  toStatus: Status,
  options?: { comment?: string; resolutionType?: string; hasEvidence?: boolean }
): TransitionValidation {
  if (!isValidTransition(fromStatus, toStatus)) {
    return { valid: false, error: `Cannot transition from "${fromStatus}" to "${toStatus}"` };
  }

  if (toStatus === 'blocked' && !options?.comment) {
    return { valid: false, error: 'A comment is required when marking an item as blocked' };
  }

  if (toStatus === 'resolved' && !options?.resolutionType) {
    return { valid: false, error: 'A resolution type is required when resolving an item' };
  }

  if (toStatus === 'resolved' && !options?.hasEvidence && options?.resolutionType !== 'false_positive') {
    return { valid: false, error: 'Evidence is required before resolving (unless resolution is false_positive)' };
  }

  return { valid: true };
}

/** Human-friendly label for transition buttons */
export function transitionLabel(to: Status): string {
  switch (to) {
    case 'in_progress': return 'Start Work';
    case 'blocked':     return 'Mark Blocked';
    case 'resolved':    return 'Resolve';
    case 'verified':    return 'Verify';
    case 'closed':      return 'Close';
    default:            return to;
  }
}

/** Color class for transition buttons */
export function transitionColor(to: Status): string {
  switch (to) {
    case 'in_progress': return 'btn-primary';
    case 'blocked':     return 'btn-danger';
    case 'resolved':    return 'btn-primary';
    case 'verified':    return 'btn-primary';
    case 'closed':      return 'btn-secondary';
    default:            return 'btn-secondary';
  }
}
